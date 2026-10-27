import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AdjustmentSettings, GeometrySettings, MaskLayer } from '../types/preset';
import { processImage } from '../utils/imageProcessor';
import { renderMaskOverlay, computeSubjectMask, computeSkyMask } from '../utils/maskEngine';
import { ZoomIn, ZoomOut, Maximize2, SplitSquareVertical, Eye, Sparkles, FolderOpen, UploadCloud, Layers } from 'lucide-react';

interface CanvasViewportProps {
  sourceImage: HTMLImageElement | null;
  settings: AdjustmentSettings;
  masks: MaskLayer[];
  geometry: GeometrySettings;
  showRubylith: boolean;
  onRevisionChange: (rev: number) => void;
  processedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  activePresetName?: string;
  onOpenFilePicker: () => void;
  onFileUpload: (file: File) => void;
  photoFormatInfo?: string | null;
  customPhotoName?: string | null;
  isLoadingFile?: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  sourceImage,
  settings,
  masks,
  geometry,
  showRubylith,
  onRevisionChange,
  processedCanvasRef,
  activePresetName,
  onOpenFilePicker,
  onFileUpload,
  photoFormatInfo,
  customPhotoName,
  isLoadingFile,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // View state
  const [zoom, setZoom] = useState<number>(1);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Render processed image
  const renderPipeline = useCallback(() => {
    if (!sourceImage || !processedCanvasRef.current) return;

    // 1. Prepare raw source canvas
    if (!originalCanvasRef.current) {
      originalCanvasRef.current = document.createElement('canvas');
    }
    const origCanvas = originalCanvasRef.current;
    if (origCanvas.width !== sourceImage.naturalWidth || origCanvas.height !== sourceImage.naturalHeight) {
      origCanvas.width = sourceImage.naturalWidth;
      origCanvas.height = sourceImage.naturalHeight;
      const oCtx = origCanvas.getContext('2d');
      oCtx?.drawImage(sourceImage, 0, 0);
    }

    // 2. Process image through pipeline
    processImage(origCanvas, processedCanvasRef.current, settings, masks, geometry);

    // 3. Render Rubylith mask overlay if enabled
    if (showRubylith) {
      const activeMask = masks.find((m) => m.enabled && (m.type === 'subject' || m.type === 'sky' || m.type === 'background'));
      if (activeMask) {
        const tCtx = processedCanvasRef.current.getContext('2d');
        const oCtx = origCanvas.getContext('2d');
        if (tCtx && oCtx) {
          const w = origCanvas.width;
          const h = origCanvas.height;
          let bmap = null;
          if (activeMask.type === 'subject') {
            bmap = computeSubjectMask(oCtx, w, h, activeMask.confidence, activeMask.feather);
          } else if (activeMask.type === 'background') {
            const sub = computeSubjectMask(oCtx, w, h, activeMask.confidence, activeMask.feather);
            const inv = new Uint8Array(w * h);
            for (let i = 0; i < sub.data.length; i++) inv[i] = 255 - sub.data[i];
            bmap = { width: w, height: h, data: inv };
          } else if (activeMask.type === 'sky') {
            bmap = computeSkyMask(oCtx, w, h, activeMask.confidence, activeMask.feather);
          }
          if (bmap) {
            renderMaskOverlay(tCtx, bmap);
          }
        }
      }
    }

    // 4. Draw to display canvas considering split / compare mode
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const dCtx = displayCanvas.getContext('2d');
    if (!dCtx) return;

    const w = processedCanvasRef.current.width;
    const h = processedCanvasRef.current.height;
    displayCanvas.width = w;
    displayCanvas.height = h;

    dCtx.clearRect(0, 0, w, h);

    if (isComparing) {
      // Show Original Only
      dCtx.drawImage(origCanvas, 0, 0);
    } else if (isSplitMode) {
      // Split Screen Comparison: Left = Original, Right = Processed
      const splitX = Math.round((splitPos / 100) * w);

      // Draw original on left half
      dCtx.save();
      dCtx.beginPath();
      dCtx.rect(0, 0, splitX, h);
      dCtx.clip();
      dCtx.drawImage(origCanvas, 0, 0);
      dCtx.restore();

      // Draw processed on right half
      dCtx.save();
      dCtx.beginPath();
      dCtx.rect(splitX, 0, w - splitX, h);
      dCtx.clip();
      dCtx.drawImage(processedCanvasRef.current, 0, 0);
      dCtx.restore();

      // Draw vertical separator line
      dCtx.strokeStyle = '#f59e0b';
      dCtx.lineWidth = 3;
      dCtx.beginPath();
      dCtx.moveTo(splitX, 0);
      dCtx.lineTo(splitX, h);
      dCtx.stroke();
    } else {
      // Normal Full View
      dCtx.drawImage(processedCanvasRef.current, 0, 0);
    }

    onRevisionChange(Date.now());
  }, [
    sourceImage,
    settings,
    masks,
    geometry,
    showRubylith,
    isComparing,
    isSplitMode,
    splitPos,
    onRevisionChange,
    processedCanvasRef,
  ]);

  useEffect(() => {
    renderPipeline();
  }, [renderPipeline]);

  // Handle Split Line Dragging
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, Math.round((x / rect.width) * 100)));
    setSplitPos(pct);
  };

  // Drag and drop photo files directly onto the canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const width = sourceImage?.naturalWidth || 0;
  const height = sourceImage?.naturalHeight || 0;
  const mp = width > 0 ? ((width * height) / 1000000).toFixed(1) : '24.2';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleSplitMouseMove}
      onMouseUp={() => setIsDraggingSplit(false)}
      onMouseLeave={() => setIsDraggingSplit(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col bg-[#07090c] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl select-none"
    >
      {/* Top Floating Viewport Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Preset Name Readout Badge & Masukan Foto Quick Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Prominent Quick Masukan Foto Button inside canvas */}
          <button
            onClick={onOpenFilePicker}
            disabled={isLoadingFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer transform active:scale-95"
            title="Klik untuk membuka/memasukkan foto dari file lokal komputer Anda"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-950" />
            <span>MASUKAN FOTO</span>
          </button>

          {/* Active Preset Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">
              {activePresetName || 'Tokina 11-16mm Pro Base'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">• {mp} MP</span>
          </div>
        </div>

        {/* View Tools: Split Screen, Compare, Zoom */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg">
          {/* Split Screen Button */}
          <button
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isSplitMode
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Bandingkan Layar Terbelah (Split Before / After)"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="text-[11px]">Bagi Layar</span>
          </button>

          {/* Hold to Compare Button */}
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isComparing
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Tahan untuk melihat foto asli sebelum editan"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tahan: Asli</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1"></div>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            title="Perkecil"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono-num text-slate-400 w-9 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.25).toFixed(2))))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            title="Perbesar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            title="Reset Ukuran (Fit)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out max-w-full max-h-full flex items-center justify-center relative shadow-2xl rounded-lg overflow-hidden border border-slate-800"
        >
          <canvas
            ref={displayCanvasRef}
            className="max-w-full max-h-[72vh] object-contain rounded"
          />

          {/* Split Divider Overlay Handle */}
          {isSplitMode && (
            <div
              onMouseDown={() => setIsDraggingSplit(true)}
              style={{ left: `${splitPos}%` }}
              className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-30 group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                ↔
              </div>
            </div>
          )}
        </div>

        {/* Labels for Split Comparison */}
        {isSplitMode && (
          <>
            <div className="absolute bottom-6 left-6 px-3 py-1 rounded-lg bg-black/75 backdrop-blur border border-slate-700 text-xs font-semibold text-slate-300 z-20 pointer-events-none">
              SEBELUM (ASLI)
            </div>
            <div className="absolute bottom-6 right-6 px-3 py-1 rounded-lg bg-amber-500/90 backdrop-blur border border-amber-400 text-xs font-bold text-slate-950 z-20 pointer-events-none">
              SESUDAH (PRESET)
            </div>
          </>
        )}

        {isComparing && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-bold shadow-lg z-20 animate-pulse pointer-events-none">
            MENAMPILKAN FOTO ASLI (SEBELUM)
          </div>
        )}

        {/* Drag and Drop Active Indicator Overlay */}
        {isDragOver && (
          <div className="absolute inset-4 z-40 flex flex-col items-center justify-center bg-amber-950/85 border-2 border-dashed border-amber-400 rounded-2xl backdrop-blur-sm animate-in fade-in duration-100">
            <UploadCloud className="w-16 h-16 text-amber-400 animate-bounce mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Lepaskan File Foto di Sini</h3>
            <p className="text-xs text-amber-200 text-center max-w-md">
              Mendukung semua format: JPG, PNG, WEBP, AVIF, TIFF, HEIC, RAW Nikon (.NEF), DNG, BMP, GIF, SVG.
            </p>
          </div>
        )}

        {/* Loading overlay when decoding large RAW or HEIC photo */}
        {isLoadingFile && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-amber-300">Mendekode File Foto...</p>
            <p className="text-xs text-slate-400">Membaca resolusi penuh untuk kalibrasi Tokina & Nikon</p>
          </div>
        )}
      </div>

      {/* Bottom Camera Spec & Drag Hint Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">
            {customPhotoName ? `Foto: ${customPhotoName}` : 'Nikon D3400'}
          </span>
          {photoFormatInfo && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono-num">
              {photoFormatInfo}
            </span>
          )}
          <span>•</span>
          <span className="text-amber-400">Tokina AT-X 116 PRO DX F2.8 ({settings.lens.focalLength}mm)</span>
          <span>•</span>
          <span>Koreksi Barel: +{settings.lens.distortionCorrection}%</span>
        </div>
        <div className="flex items-center gap-3 font-mono-num text-[10px]">
          <span className="text-slate-400 hidden sm:inline">
            Tarik & Lepas (Drag-and-Drop) atau Ctrl+V foto apa saja
          </span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Siap Edit & Simpan
          </span>
        </div>
      </div>
    </div>
  );
};
