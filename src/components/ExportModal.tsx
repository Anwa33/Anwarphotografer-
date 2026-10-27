import React, { useState } from 'react';
import { AdjustmentSettings, Preset } from '../types/preset';
import { exportHighQualityImage, exportPresetXMP, exportCubeLUT, exportPresetJSON, exportStandaloneHTMLFile } from '../utils/exporters';
import { Download, Check, Sparkles, X, FileImage, Sliders, Film, Layers, Code } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activePreset: Preset;
  settings: AdjustmentSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  activePreset,
  settings,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'xmp' | 'cube' | 'json' | 'html'>('png');
  const [quality, setQuality] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const canvas = canvasRef.current;
  const width = canvas ? canvas.width : 0;
  const height = canvas ? canvas.height : 0;
  const megapixels = ((width * height) / 1000000).toFixed(1);

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportedSuccess(false);

    try {
      if (format === 'png' || format === 'jpeg' || format === 'webp') {
        if (canvas) {
          await exportHighQualityImage(canvas, format, quality, `Nikon_D3400_${activePreset.name.replace(/\s+/g, '_')}`);
        }
      } else if (format === 'xmp') {
        exportPresetXMP(activePreset);
      } else if (format === 'cube') {
        exportCubeLUT(settings, activePreset.name);
      } else if (format === 'json') {
        exportPresetJSON(activePreset);
      } else if (format === 'html') {
        exportStandaloneHTMLFile();
      }

      setExportedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsExporting(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Penyimpanan Kualitas Terbaik (Ultra-Fidelity)
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Hasil proses resolusi asli tanpa kompresi berlebih untuk Nikon D3400 + Tokina 11-16mm
            </p>
          </div>
        </div>

        {/* Specs Box */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400 text-[10px]">Resolusi Native Canvas:</div>
            <div className="font-mono-num font-bold text-slate-100">
              {width} × {height} px ({megapixels} Megapiksel)
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">Preset Diterapkan:</div>
            <div className="font-semibold text-amber-400">{activePreset.name}</div>
          </div>
        </div>

        {/* Format Selection Grid */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-slate-300">Pilih Format Penyimpanan:</label>
          <div className="grid grid-cols-3 gap-2">
            {/* PNG */}
            <button
              onClick={() => setFormat('png')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'png'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">PNG Lossless</div>
              <div className="text-[10px] text-slate-400">100% Kualitas Asli</div>
            </button>

            {/* JPEG 100% */}
            <button
              onClick={() => setFormat('jpeg')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'jpeg'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">JPEG Pro 100%</div>
              <div className="text-[10px] text-slate-400">Chroma 4:4:4</div>
            </button>

            {/* WebP */}
            <button
              onClick={() => setFormat('webp')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'webp'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4 text-blue-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">WebP Modern</div>
              <div className="text-[10px] text-slate-400">Ukuran Efisien</div>
            </button>

            {/* Lightroom XMP */}
            <button
              onClick={() => setFormat('xmp')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'xmp'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">Adobe .XMP</div>
              <div className="text-[10px] text-slate-400">Untuk Lightroom & ACR</div>
            </button>

            {/* 3D LUT */}
            <button
              onClick={() => setFormat('cube')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'cube'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4 text-red-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">3D LUT (.CUBE)</div>
              <div className="text-[10px] text-slate-400">Premiere & DaVinci</div>
            </button>

            {/* JSON Preset */}
            <button
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'json'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">Preset JSON</div>
              <div className="text-[10px] text-slate-400">Backup Pengaturan</div>
            </button>

            {/* Standalone HTML File */}
            <button
              onClick={() => setFormat('html')}
              className={`p-3 rounded-xl border text-left transition-all ${
                format === 'html'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-slate-100">File HTML Offline</div>
              <div className="text-[10px] text-slate-400">Jalankan Tanpa Server</div>
            </button>
          </div>
        </div>

        {/* JPEG Quality Slider if JPEG is selected */}
        {format === 'jpeg' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Kualitas JPEG:</span>
              <span className="font-mono-num text-amber-400 font-bold">
                {Math.round(quality * 100)}% (Maksimal)
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.0"
              step="0.01"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Nilai 100% mematikan kompresi artefak dan menjaga ketajaman garis lensa Tokina 11-16mm.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="flex-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {exportedSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Berhasil Disimpan!</span>
              </>
            ) : isExporting ? (
              <span>Memproses File...</span>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Simpan Kualitas Tertinggi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
