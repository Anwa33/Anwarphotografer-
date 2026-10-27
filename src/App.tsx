import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AdjustmentSettings, GeometrySettings, MaskLayer, Preset } from './types/preset';
import { generate1000Presets, DEFAULT_ADJUSTMENTS, INITIAL_MASKS } from './data/presetGenerator';
import { SAMPLE_PHOTOS } from './utils/sampleImages';
import { decodeAnyPhotoFile } from './utils/fileImageDecoder';
import { Header } from './components/Header';
import { CanvasViewport } from './components/CanvasViewport';
import { HistogramView } from './components/HistogramView';
import { MaskingPanel } from './components/MaskingPanel';
import { PresetPanel } from './components/PresetPanel';
import { AdjustmentPanel } from './components/AdjustmentPanel';
import { ExportModal } from './components/ExportModal';
import { SavePresetModal } from './components/SavePresetModal';
import {
  Sparkles,
  Camera,
  Layers,
  SlidersHorizontal,
  Maximize2,
  Check,
  AlertCircle,
  Download,
  FolderOpen,
} from 'lucide-react';

type MobileActiveTab = 'presets' | 'lens' | 'masking' | 'adjustments' | 'canvas';

export default function App() {
  // 1,000 Presets Library
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('nikon_tokina_custom_presets');
    const base = generate1000Presets();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...base];
      } catch (e) {
        console.error(e);
      }
    }
    return base;
  });

  const [activePresetId, setActivePresetId] = useState<string>('astro-001');

  // Adjustments & Masks
  const [settings, setSettings] = useState<AdjustmentSettings>(() => {
    return presets[0] ? JSON.parse(JSON.stringify(presets[0].settings)) : DEFAULT_ADJUSTMENTS;
  });

  const [masks, setMasks] = useState<MaskLayer[]>(INITIAL_MASKS);
  const [showRubylith, setShowRubylith] = useState<boolean>(false);
  const [geometry, setGeometry] = useState<GeometrySettings>({
    rotation: 0,
    straighten: 0,
    flipH: false,
    flipV: false,
    aspectRatio: 'original',
  });

  // Current Active Image & Format Information
  const [currentSampleId, setCurrentSampleId] = useState<string>('sample-landscape');
  const [customPhotoName, setCustomPhotoName] = useState<string | null>(null);
  const [photoFormatInfo, setPhotoFormatInfo] = useState<string | null>(null);
  const [photoResolution, setPhotoResolution] = useState<{ width: number; height: number } | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Loading & Notification Toast
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState<boolean>(false);

  // Desktop Right Panel Tab: 'masking' or 'adjustments'
  const [rightPanelTab, setRightPanelTab] = useState<'masking' | 'adjustments'>('masking');

  // Android Mobile Tab: 'presets' | 'lens' | 'masking' | 'adjustments' | 'canvas'
  const [mobileTab, setMobileTab] = useState<MobileActiveTab>('presets');

  // Canvas Ref for processing & export
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revision, setRevision] = useState<number>(0);

  // Show auto-dismissing Toast
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success', duration = 4000) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, duration);
  }, []);

  // Load Initial Sample Photo
  useEffect(() => {
    const sample = SAMPLE_PHOTOS.find((s) => s.id === currentSampleId) || SAMPLE_PHOTOS[0];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setPhotoResolution({ width: img.naturalWidth, height: img.naturalHeight });
      setRevision(Date.now());
    };
    img.src = sample.dataUrl;
  }, [currentSampleId]);

  // Handle User File Upload - Universal Decoder for ALL photo formats
  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoadingFile(true);
    try {
      const decoded = await decodeAnyPhotoFile(file);
      setLoadedImage(decoded.image);
      setCustomPhotoName(decoded.fileName);
      setPhotoFormatInfo(decoded.fileFormat);
      setPhotoResolution({ width: decoded.width, height: decoded.height });
      setRevision(Date.now());

      showToast(
        `Berhasil memuat foto: ${decoded.fileName} (${decoded.fileFormat}, ${decoded.width} × ${decoded.height} px)`,
        'success'
      );
    } catch (err: any) {
      console.error('File decode error:', err);
      showToast(
        err.message || 'Gagal membuka foto. Pastikan file adalah gambar atau RAW yang valid.',
        'error',
        6000
      );
    } finally {
      setIsLoadingFile(false);
    }
  }, [showToast]);

  // Global Clipboard Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileUpload(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileUpload]);

  // Prevent browser from navigating away on unwanted drag & drop
  useEffect(() => {
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDrag);
    window.addEventListener('drop', preventDrag);
    return () => {
      window.removeEventListener('dragover', preventDrag);
      window.removeEventListener('drop', preventDrag);
    };
  }, []);

  // Trigger file picker from any button
  const handleOpenFilePicker = () => {
    const input = document.getElementById('photo-file-input') as HTMLInputElement | null;
    input?.click();
  };

  // Switch to another sample photo
  const handleSelectSample = (sampleId: string) => {
    setCustomPhotoName(null);
    setPhotoFormatInfo(null);
    setCurrentSampleId(sampleId);
  };

  // Apply a preset from 1,000 presets collection
  const handleSelectPreset = (preset: Preset) => {
    setActivePresetId(preset.id);
    setSettings(JSON.parse(JSON.stringify(preset.settings)));
    setRevision(Date.now());
  };

  // Toggle favorite on preset
  const handleToggleFavorite = (presetId: string) => {
    setPresets((prev) =>
      prev.map((p) => {
        if (p.id === presetId) {
          return { ...p, isFavorite: !p.isFavorite };
        }
        return p;
      })
    );
  };

  // Save custom user preset
  const handleSaveCustomPreset = (newPreset: Preset) => {
    setPresets((prev) => {
      const updated = [newPreset, ...prev];
      const customOnes = updated.filter((p) => p.id.startsWith('custom-'));
      localStorage.setItem('nikon_tokina_custom_presets', JSON.stringify(customOnes));
      return updated;
    });
    setActivePresetId(newPreset.id);
    setSettings(JSON.parse(JSON.stringify(newPreset.settings)));
    showToast(`Preset "${newPreset.name}" berhasil disimpan!`, 'success');
  };

  // Reset all adjustments
  const handleResetAll = () => {
    setSettings(JSON.parse(JSON.stringify(DEFAULT_ADJUSTMENTS)));
    setMasks(INITIAL_MASKS.map((m) => ({ ...m, enabled: false })));
    setGeometry({
      rotation: 0,
      straighten: 0,
      flipH: false,
      flipV: false,
      aspectRatio: 'original',
    });
    setRevision(Date.now());
    showToast('Semua setelan slider telah direset.', 'info');
  };

  const activePreset = useMemo(() => {
    return presets.find((p) => p.id === activePresetId) || presets[0];
  }, [presets, activePresetId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090c] text-slate-100 overflow-hidden font-sans select-none">
      {/* Hidden Offscreen Canvas for full-resolution rendering pipeline */}
      <canvas ref={processedCanvasRef} className="hidden" />

      {/* Header */}
      <Header
        currentSampleId={currentSampleId}
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSavePresetModal={() => setIsSavePresetModalOpen(true)}
        customPhotoName={customPhotoName}
        photoFormatInfo={photoFormatInfo}
        photoResolution={photoResolution}
        isLoadingFile={isLoadingFile}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-top duration-200 max-w-[90vw] ${
            toastMessage.type === 'error'
              ? 'bg-red-950/95 text-red-200 border-red-700'
              : toastMessage.type === 'info'
              ? 'bg-blue-950/95 text-blue-200 border-blue-700'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="truncate">{toastMessage.text}</span>
        </div>
      )}

      {/* ==================== DESKTOP WORKSPACE (lg:flex) ==================== */}
      <div className="hidden lg:flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Column: 1,000 Presets Panel */}
        <aside className="w-80 xl:w-96 flex flex-col bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-3 shadow-xl overflow-hidden shrink-0">
          <PresetPanel
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onToggleFavorite={handleToggleFavorite}
          />
        </aside>

        {/* Center Column: Interactive Canvas Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <CanvasViewport
            sourceImage={loadedImage}
            settings={settings}
            masks={masks}
            geometry={geometry}
            showRubylith={showRubylith}
            onRevisionChange={setRevision}
            processedCanvasRef={processedCanvasRef}
            activePresetName={activePreset?.name}
            onOpenFilePicker={handleOpenFilePicker}
            onFileUpload={handleFileUpload}
            photoFormatInfo={photoFormatInfo}
            customPhotoName={customPhotoName}
            isLoadingFile={isLoadingFile}
          />
        </main>

        {/* Right Column: Inspector Tools */}
        <aside className="w-80 xl:w-96 flex flex-col bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-3 shadow-xl overflow-hidden shrink-0">
          <HistogramView canvasRef={processedCanvasRef} revision={revision} />

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-3 text-xs">
            <button
              onClick={() => setRightPanelTab('masking')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                rightPanelTab === 'masking'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Selek Subjek & Latar</span>
            </button>

            <button
              onClick={() => setRightPanelTab('adjustments')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                rightPanelTab === 'adjustments'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Setelan Detail</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-0.5">
            {rightPanelTab === 'masking' ? (
              <MaskingPanel
                masks={masks}
                onUpdateMasks={(newMasks) => {
                  setMasks(newMasks);
                  setRevision(Date.now());
                }}
                showRubylith={showRubylith}
                onToggleRubylith={setShowRubylith}
              />
            ) : (
              <AdjustmentPanel
                settings={settings}
                onChange={(newSettings) => {
                  setSettings(newSettings);
                  setRevision(Date.now());
                }}
                geometry={geometry}
                onGeometryChange={(newGeo) => {
                  setGeometry(newGeo);
                  setRevision(Date.now());
                }}
                onResetAll={handleResetAll}
              />
            )}
          </div>
        </aside>
      </div>

      {/* ==================== ANDROID MOBILE WORKSPACE (lg:hidden) ==================== */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden pb-16">
        {/* Top Split: Live Viewport Canvas (visible across all editing modes so mobile users see edits live!) */}
        <div
          className={`flex flex-col transition-all duration-200 border-b border-slate-800 ${
            mobileTab === 'canvas' ? 'flex-1' : 'h-[44vh] sm:h-[48vh] shrink-0'
          }`}
        >
          <CanvasViewport
            sourceImage={loadedImage}
            settings={settings}
            masks={masks}
            geometry={geometry}
            showRubylith={showRubylith}
            onRevisionChange={setRevision}
            processedCanvasRef={processedCanvasRef}
            activePresetName={activePreset?.name}
            onOpenFilePicker={handleOpenFilePicker}
            onFileUpload={handleFileUpload}
            photoFormatInfo={photoFormatInfo}
            customPhotoName={customPhotoName}
            isLoadingFile={isLoadingFile}
          />
        </div>

        {/* Bottom Split: Active Tool Drawer / Panel (when not in full canvas mode) */}
        {mobileTab !== 'canvas' && (
          <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden p-2.5">
            {/* TAB 1: 1,000 PRESETS */}
            {mobileTab === 'presets' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <PresetPanel
                  presets={presets}
                  activePresetId={activePresetId}
                  onSelectPreset={handleSelectPreset}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            )}

            {/* TAB 2: TOKINA LENS 11-16mm */}
            {mobileTab === 'lens' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/40">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-bold text-amber-400">
                        Tokina AT-X 11-16mm F2.8 PRO DX II
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Kamera Nikon D3400 (Sensor 24.2 MP DX)
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-num text-[10px] font-bold">
                      {settings.lens.focalLength}mm
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono-num mt-2">
                    {[11, 14, 16].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          const dist = f === 11 ? 55 : f === 14 ? 35 : 15;
                          const vig = f === 11 ? 65 : f === 14 ? 40 : 25;
                          setSettings({
                            ...settings,
                            lens: {
                              ...settings.lens,
                              focalLength: f as 11 | 14 | 16,
                              distortionCorrection: dist,
                              vignetteRemoval: vig,
                            },
                          });
                          setRevision(Date.now());
                        }}
                        className={`py-2 rounded-xl text-center font-bold min-h-[44px] transition-all ${
                          settings.lens.focalLength === f
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {f}mm {f === 11 ? '(Ultra)' : f === 16 ? '(Portrait)' : '(Mid)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Koreksi Distorsi Barel (11mm)</span>
                      <span className="font-mono-num text-amber-400">
                        {settings.lens.distortionCorrection > 0 ? `+${settings.lens.distortionCorrection}` : settings.lens.distortionCorrection}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="100"
                      value={settings.lens.distortionCorrection}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          lens: { ...settings.lens, distortionCorrection: Number(e.target.value) },
                        });
                        setRevision(Date.now());
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Penghilang Vignette f/2.8</span>
                      <span className="font-mono-num text-amber-400">
                        +{settings.lens.vignetteRemoval}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.lens.vignetteRemoval}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          lens: { ...settings.lens, vignetteRemoval: Number(e.target.value) },
                        });
                        setRevision(Date.now());
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Koreksi Aberasi Kromatik (CA Fix)</span>
                      <span className="font-mono-num text-amber-400">
                        {settings.lens.chromaticAberrationFix}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.lens.chromaticAberrationFix}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          lens: { ...settings.lens, chromaticAberrationFix: Number(e.target.value) },
                        });
                        setRevision(Date.now());
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Ketajaman Sensor Nikon D3400</span>
                      <span className="font-mono-num text-amber-400">
                        {settings.lens.antiAliasingSharpness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.lens.antiAliasingSharpness}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          lens: { ...settings.lens, antiAliasingSharpness: Number(e.target.value) },
                        });
                        setRevision(Date.now());
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MASKING SUBJEK & LATAR BELAKANG */}
            {mobileTab === 'masking' && (
              <div className="flex-1 overflow-y-auto pr-0.5">
                <MaskingPanel
                  masks={masks}
                  onUpdateMasks={(newMasks) => {
                    setMasks(newMasks);
                    setRevision(Date.now());
                  }}
                  showRubylith={showRubylith}
                  onToggleRubylith={setShowRubylith}
                />
              </div>
            )}

            {/* TAB 4: DETAIL ADJUSTMENTS */}
            {mobileTab === 'adjustments' && (
              <div className="flex-1 overflow-y-auto pr-0.5">
                <AdjustmentPanel
                  settings={settings}
                  onChange={(newSettings) => {
                    setSettings(newSettings);
                    setRevision(Date.now());
                  }}
                  geometry={geometry}
                  onGeometryChange={(newGeo) => {
                    setGeometry(newGeo);
                    setRevision(Date.now());
                  }}
                  onResetAll={handleResetAll}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== ANDROID FIXED BOTTOM NAVIGATION DOCK ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-t border-slate-800/90 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* TAB 1: 1,000 PRESETS */}
          <button
            onClick={() => setMobileTab('presets')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-all ${
              mobileTab === 'presets' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">1,000 Preset</span>
            {mobileTab === 'presets' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>

          {/* TAB 2: TOKINA LENS */}
          <button
            onClick={() => setMobileTab('lens')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-all ${
              mobileTab === 'lens' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Lensa Tokina</span>
            {mobileTab === 'lens' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>

          {/* TAB 3: MASKING SUBJEK & LATAR */}
          <button
            onClick={() => setMobileTab('masking')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-all ${
              mobileTab === 'masking' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Subjek/Latar</span>
            {mobileTab === 'masking' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>

          {/* TAB 4: NADA & WARNA */}
          <button
            onClick={() => setMobileTab('adjustments')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-all ${
              mobileTab === 'adjustments' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Nada & Warna</span>
            {mobileTab === 'adjustments' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>

          {/* TAB 5: LAYAR PENUH (FULL CANVAS) */}
          <button
            onClick={() => setMobileTab('canvas')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-all ${
              mobileTab === 'canvas' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Layar Penuh</span>
            {mobileTab === 'canvas' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>}
          </button>
        </div>
      </nav>

      {/* Export Modal with Highest Quality (PNG Lossless, JPEG 100%, WebP, .XMP, .CUBE, Standalone HTML) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvasRef={processedCanvasRef}
        activePreset={activePreset}
        settings={settings}
      />

      {/* Save Custom Preset Modal */}
      <SavePresetModal
        isOpen={isSavePresetModalOpen}
        onClose={() => setIsSavePresetModalOpen(false)}
        settings={settings}
        onSave={handleSaveCustomPreset}
      />
    </div>
  );
}
