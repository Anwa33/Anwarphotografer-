import React, { useState } from 'react';
import { AdjustmentSettings, GeometrySettings, TokinaLensProfile } from '../types/preset';
import { ToneCurveEditor } from './ToneCurveEditor';
import { HSLPanel } from './HSLPanel';
import { ColorWheel } from './ColorWheel';
import {
  Camera,
  SunMedium,
  Activity,
  Palette,
  Sparkles,
  Sliders,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AdjustmentPanelProps {
  settings: AdjustmentSettings;
  onChange: (settings: AdjustmentSettings) => void;
  geometry: GeometrySettings;
  onGeometryChange: (geo: GeometrySettings) => void;
  onResetAll: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  settings,
  onChange,
  geometry,
  onGeometryChange,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<
    'lens' | 'basic' | 'curve' | 'hsl' | 'color_grading' | 'detail' | 'geometry'
  >('lens');

  const updateField = <K extends keyof AdjustmentSettings>(field: K, value: AdjustmentSettings[K]) => {
    onChange({ ...settings, [field]: value });
  };

  const updateLens = <K extends keyof TokinaLensProfile>(field: K, value: TokinaLensProfile[K]) => {
    onChange({
      ...settings,
      lens: { ...settings.lens, [field]: value },
    });
  };

  const setWBStandard = (type: 'daylight' | 'cloudy' | 'shade' | 'tungsten' | 'fluorescent') => {
    switch (type) {
      case 'daylight': onChange({ ...settings, temperature: 0, tint: 0 }); break;
      case 'cloudy': onChange({ ...settings, temperature: 18, tint: 4 }); break;
      case 'shade': onChange({ ...settings, temperature: 28, tint: 8 }); break;
      case 'tungsten': onChange({ ...settings, temperature: -35, tint: -6 }); break;
      case 'fluorescent': onChange({ ...settings, temperature: -12, tint: 16 }); break;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Tab Navigation Icons */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveTab('lens')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'lens' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Profil Lensa Tokina 11-16mm & Sensor Nikon D3400"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lensa Tokina</span>
        </button>

        <button
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'basic' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Pencahayaan & Nada Dasar"
        >
          <SunMedium className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dasar</span>
        </button>

        <button
          onClick={() => setActiveTab('curve')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'curve' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Kurva Nada RGB"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kurva</span>
        </button>

        <button
          onClick={() => setActiveTab('hsl')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'hsl' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Mixer Warna HSL 8-Kanal"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HSL</span>
        </button>

        <button
          onClick={() => setActiveTab('color_grading')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'color_grading' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Color Grading 3-Way Split Toning"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Grading</span>
        </button>

        <button
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'detail' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Detail, Ketajaman & Grain"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Detail</span>
        </button>

        <button
          onClick={() => setActiveTab('geometry')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'geometry' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Geometri, Crop & Rotasi"
        >
          <Crop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Geometri</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* ==================== TAB 1: TOKINA LENS & NIKON D3400 ==================== */}
        {activeTab === 'lens' && (
          <div className="space-y-4">
            {/* Tokina Lens Header Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[13px] font-bold text-amber-400">
                    Tokina AT-X 11-16mm F2.8 PRO DX II
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Kamera Nikon D3400 (Sensor 24.2 MP DX tanpa OLPF)
                  </div>
                </div>
                <button
                  onClick={() => updateLens('enabled', !settings.lens.enabled)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                    settings.lens.enabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {settings.lens.enabled ? 'PROFIL AKTIF' : 'PROFIL NONAKTIF'}
                </button>
              </div>

              {/* Focal Length Selector */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-300 mb-1.5 font-medium">
                  Pilih Panjang Fokus Bidikan:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[11, 14, 16].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        updateLens('focalLength', f as 11 | 14 | 16);
                        if (f === 11) {
                          updateLens('distortionCorrection', 55);
                          updateLens('vignetteRemoval', 65);
                        } else if (f === 14) {
                          updateLens('distortionCorrection', 35);
                          updateLens('vignetteRemoval', 40);
                        } else {
                          updateLens('distortionCorrection', 15);
                          updateLens('vignetteRemoval', 25);
                        }
                      }}
                      className={`py-1.5 rounded-lg text-center font-mono-num text-[11px] border transition-all ${
                        settings.lens.focalLength === f
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}mm {f === 11 ? '(Ultra-Wide)' : f === 16 ? '(Portrait)' : '(Normal)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lens Distortion Slider */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Koreksi Distorsi Barel 11mm</span>
                  <span className="font-mono-num text-amber-400">
                    {settings.lens.distortionCorrection > 0 ? `+${settings.lens.distortionCorrection}` : settings.lens.distortionCorrection}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={settings.lens.distortionCorrection}
                  onChange={(e) => updateLens('distortionCorrection', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>-50 (Fisheye Cembung)</span>
                  <button
                    onClick={() => updateLens('distortionCorrection', 50)}
                    className="text-amber-400 hover:underline"
                  >
                    Auto Tokina 11mm (+50)
                  </button>
                  <span>+100 (Lurus Sempurna)</span>
                </div>
              </div>

              {/* Vignette Removal */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Penghilang Vignetting Sudut f/2.8</span>
                  <span className="font-mono-num text-amber-400">+{settings.lens.vignetteRemoval}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.lens.vignetteRemoval}
                  onChange={(e) => updateLens('vignetteRemoval', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-slate-500">
                  Mencerahkan kembali 4 sudut foto yang menggelap alami pada bukaan f/2.8 lensa Tokina.
                </p>
              </div>

              {/* Chromatic Aberration & Purple Defringe */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Koreksi Aberasi Kromatik (CA Fix)</span>
                  <span className="font-mono-num text-amber-400">{settings.lens.chromaticAberrationFix}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.lens.chromaticAberrationFix}
                  onChange={(e) => updateLens('chromaticAberrationFix', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* D3400 Microcontrast Boost */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Ketajaman Sensor Nikon D3400</span>
                  <span className="font-mono-num text-amber-400">{settings.lens.antiAliasingSharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.lens.antiAliasingSharpness}
                  onChange={(e) => updateLens('antiAliasingSharpness', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-slate-500">
                  Optimasi ketajaman tingkat piksel tanpa filter optik low-pass (OLPF).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: BASIC TONES ==================== */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* White Balance Presets */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  White Balance Nikon
                </span>
                <button
                  onClick={() => onChange({ ...settings, temperature: 0, tint: 0 })}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  As Shot (Default)
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1 text-[10px]">
                <button
                  onClick={() => setWBStandard('daylight')}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Daylight
                </button>
                <button
                  onClick={() => setWBStandard('cloudy')}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cloudy
                </button>
                <button
                  onClick={() => setWBStandard('shade')}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Shade
                </button>
                <button
                  onClick={() => setWBStandard('tungsten')}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Tungsten
                </button>
                <button
                  onClick={() => setWBStandard('fluorescent')}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Fluor.
                </button>
              </div>

              {/* Temperature & Tint Sliders */}
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Suhu Warna (Temp)</span>
                    <span className="font-mono-num text-amber-400">
                      {settings.temperature > 0 ? `+${settings.temperature}` : settings.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    value={settings.temperature}
                    onChange={(e) => updateField('temperature', Number(e.target.value))}
                    className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-slate-600 to-amber-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Tint (Rona)</span>
                    <span className="font-mono-num text-amber-400">
                      {settings.tint > 0 ? `+${settings.tint}` : settings.tint}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.tint}
                    onChange={(e) => updateField('tint', Number(e.target.value))}
                    className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-slate-600 to-pink-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Tone Sliders */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Rentang Nada (Tone Range)
              </div>

              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-200 font-medium">Eksposur (EV)</span>
                  <span className="font-mono-num text-amber-400">
                    {settings.exposure > 0 ? `+${settings.exposure.toFixed(2)}` : settings.exposure.toFixed(2)} EV
                  </span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={settings.exposure}
                  onChange={(e) => updateField('exposure', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Kontras</span>
                  <span className="font-mono-num text-amber-400">{settings.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.contrast}
                  onChange={(e) => updateField('contrast', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Highlights & Shadows */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Sorotan</span>
                    <span className="font-mono-num text-amber-400">{settings.highlights}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.highlights}
                    onChange={(e) => updateField('highlights', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Bayangan</span>
                    <span className="font-mono-num text-amber-400">{settings.shadows}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.shadows}
                    onChange={(e) => updateField('shadows', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Whites & Blacks */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Putih</span>
                    <span className="font-mono-num text-amber-400">{settings.whites}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.whites}
                    onChange={(e) => updateField('whites', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Hitam</span>
                    <span className="font-mono-num text-amber-400">{settings.blacks}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.blacks}
                    onChange={(e) => updateField('blacks', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Presence: Clarity, Dehaze, Vibrance, Saturation */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Kehadiran & Warna (Presence)
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Kejernihan (Clarity)</span>
                  <span className="font-mono-num text-amber-400">{settings.clarity}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.clarity}
                  onChange={(e) => updateField('clarity', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Dehaze (Hapus Kabut / Asap)</span>
                  <span className="font-mono-num text-amber-400">{settings.dehaze}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.dehaze}
                  onChange={(e) => updateField('dehaze', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Vibrance</span>
                    <span className="font-mono-num text-amber-400">{settings.vibrance}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.vibrance}
                    onChange={(e) => updateField('vibrance', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Saturasi</span>
                    <span className="font-mono-num text-amber-400">{settings.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.saturation}
                    onChange={(e) => updateField('saturation', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TONE CURVE ==================== */}
        {activeTab === 'curve' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <ToneCurveEditor curve={settings.curve} onChange={(c) => updateField('curve', c)} />
          </div>
        )}

        {/* ==================== TAB 4: HSL COLOR MIXER ==================== */}
        {activeTab === 'hsl' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <HSLPanel hsl={settings.hsl} onChange={(h) => updateField('hsl', h)} />
          </div>
        )}

        {/* ==================== TAB 5: COLOR GRADING 3-WAY ==================== */}
        {activeTab === 'color_grading' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              3-Way Color Grading Wheels
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <ColorWheel
                label="Bayangan (Shadows)"
                grade={settings.colorGrading.shadows}
                onChange={(g) =>
                  updateField('colorGrading', { ...settings.colorGrading, shadows: g })
                }
              />
              <ColorWheel
                label="Midtones"
                grade={settings.colorGrading.midtones}
                onChange={(g) =>
                  updateField('colorGrading', { ...settings.colorGrading, midtones: g })
                }
              />
              <ColorWheel
                label="Sorotan (Highlights)"
                grade={settings.colorGrading.highlights}
                onChange={(g) =>
                  updateField('colorGrading', { ...settings.colorGrading, highlights: g })
                }
              />
            </div>

            {/* Balance & Blending */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Keseimbangan (Balance)</span>
                  <span className="font-mono-num text-amber-400">{settings.colorGrading.balance}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.colorGrading.balance}
                  onChange={(e) =>
                    updateField('colorGrading', {
                      ...settings.colorGrading,
                      balance: Number(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: DETAIL & GRAIN ==================== */}
        {activeTab === 'detail' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            {/* Sharpening */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Ketajaman & Noise Sensor
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Ketajaman Gambar</span>
                  <span className="font-mono-num text-amber-400">{settings.sharpening}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sharpening}
                  onChange={(e) => updateField('sharpening', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Peredam Bising (Noise Reduction)</span>
                  <span className="font-mono-num text-amber-400">{settings.noiseReduction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.noiseReduction}
                  onChange={(e) => updateField('noiseReduction', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Film Grain */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Efek Grain Film Analog 35mm
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Jumlah Grain</span>
                  <span className="font-mono-num text-amber-400">{settings.grainAmount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.grainAmount}
                  onChange={(e) => updateField('grainAmount', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Vignette */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Vignette Pasca-Koreksi
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Jumlah Vignette</span>
                  <span className="font-mono-num text-amber-400">{settings.vignetteAmount}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.vignetteAmount}
                  onChange={(e) => updateField('vignetteAmount', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: GEOMETRY & CROP ==================== */}
        {activeTab === 'geometry' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Orientasi & Rasio Aspek
            </div>

            {/* Aspect Ratio Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Rasio Crop Kamera:</span>
              <div className="grid grid-cols-5 gap-1 text-[10px]">
                {(
                  [
                    ['original', 'Asli'],
                    ['3:2', '3:2 (D3400)'],
                    ['16:9', '16:9 (Cinema)'],
                    ['4:5', '4:5 (IG)'],
                    ['1:1', '1:1 (Kotak)'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onGeometryChange({ ...geometry, aspectRatio: key })}
                    className={`py-1 rounded text-center font-mono-num transition-all ${
                      geometry.aspectRatio === key
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotate and Flip Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() =>
                  onGeometryChange({
                    ...geometry,
                    rotation: ((geometry.rotation - 90) % 360),
                  })
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Putar 90° Kiri</span>
              </button>

              <button
                onClick={() =>
                  onGeometryChange({
                    ...geometry,
                    rotation: ((geometry.rotation + 90) % 360),
                  })
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar 90° Kanan</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onGeometryChange({ ...geometry, flipH: !geometry.flipH })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] ${
                  geometry.flipH
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Balik Horizontal</span>
              </button>

              <button
                onClick={() => onGeometryChange({ ...geometry, flipV: !geometry.flipV })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] ${
                  geometry.flipV
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Balik Vertikal</span>
              </button>
            </div>

            {/* Fine Straighten Slider */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Pelurusan Horizon (Fine Straighten)</span>
                <span className="font-mono-num text-amber-400">{geometry.rotation}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={geometry.rotation}
                onChange={(e) => onGeometryChange({ ...geometry, rotation: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>-45°</span>
                <button
                  onClick={() => onGeometryChange({ ...geometry, rotation: 0 })}
                  className="text-amber-400 hover:underline"
                >
                  Reset 0°
                </button>
                <span>+45°</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Reset All */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Preset Studio Pro</span>
        <button
          onClick={onResetAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-300 text-slate-400 text-[10px] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Semua Slider</span>
        </button>
      </div>
    </div>
  );
};
