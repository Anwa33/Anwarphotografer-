import React, { useState } from 'react';
import { MaskLayer, MaskTarget } from '../types/preset';
import { UserCheck, Layers, Eye, EyeOff, Sparkles, Sun, CloudRain, CircleDot, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface MaskingPanelProps {
  masks: MaskLayer[];
  onUpdateMasks: (newMasks: MaskLayer[]) => void;
  showRubylith: boolean;
  onToggleRubylith: (show: boolean) => void;
}

export const MaskingPanel: React.FC<MaskingPanelProps> = ({
  masks,
  onUpdateMasks,
  showRubylith,
  onToggleRubylith,
}) => {
  const [activeMaskId, setActiveMaskId] = useState<string>('mask-subject');

  const activeMask = masks.find((m) => m.id === activeMaskId) || masks[0];

  const updateActiveMask = (updater: (prev: MaskLayer) => MaskLayer) => {
    onUpdateMasks(
      masks.map((m) => {
        if (m.id === activeMaskId) {
          return updater(m);
        }
        return m;
      })
    );
  };

  const toggleMaskEnabled = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateMasks(
      masks.map((m) => {
        if (m.id === id) {
          return { ...m, enabled: !m.enabled };
        }
        return m;
      })
    );
  };

  const applyQuickMaskRecipe = (recipe: 'pop_subject' | 'darken_bg' | 'dramatic_sky') => {
    if (recipe === 'pop_subject') {
      onUpdateMasks(
        masks.map((m) => {
          if (m.id === 'mask-subject') {
            return {
              ...m,
              enabled: true,
              adjustments: {
                ...m.adjustments,
                exposure: 0.45,
                clarity: 25,
                shadows: 20,
                sharpness: 30,
              },
            };
          }
          return m;
        })
      );
      setActiveMaskId('mask-subject');
    } else if (recipe === 'darken_bg') {
      onUpdateMasks(
        masks.map((m) => {
          if (m.id === 'mask-background') {
            return {
              ...m,
              enabled: true,
              adjustments: {
                ...m.adjustments,
                exposure: -0.4,
                saturation: -15,
                dehaze: 15,
                blur: 10,
              },
            };
          }
          return m;
        })
      );
      setActiveMaskId('mask-background');
    } else if (recipe === 'dramatic_sky') {
      onUpdateMasks(
        masks.map((m) => {
          if (m.id === 'mask-sky') {
            return {
              ...m,
              enabled: true,
              adjustments: {
                ...m.adjustments,
                exposure: -0.55,
                highlights: -45,
                dehaze: 35,
                saturation: 25,
                temperature: -15,
              },
            };
          }
          return m;
        })
      );
      setActiveMaskId('mask-sky');
    }
  };

  const getTargetIcon = (type: MaskTarget) => {
    switch (type) {
      case 'subject': return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'background': return <Layers className="w-4 h-4 text-blue-400" />;
      case 'sky': return <CloudRain className="w-4 h-4 text-amber-400" />;
      case 'radial': return <CircleDot className="w-4 h-4 text-purple-400" />;
      default: return <SlidersHorizontal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Rubylith Toggle */}
      <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[12px] font-bold text-slate-200">AI Masking Subjek & Latar</div>
            <div className="text-[10px] text-slate-400">Pemisahan selektif berbasis saliensi sensor Nikon</div>
          </div>
        </div>

        <button
          onClick={() => onToggleRubylith(!showRubylith)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-all ${
            showRubylith
              ? 'bg-red-600/20 border-red-500/50 text-red-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Tampilkan area seleksi bertinta merah (Rubylith)"
        >
          {showRubylith ? <Eye className="w-3.5 h-3.5 text-red-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Overlay Mask</span>
        </button>
      </div>

      {/* Quick 1-Click Masking Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => applyQuickMaskRecipe('pop_subject')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 transition-all text-center"
        >
          <UserCheck className="w-4 h-4 mb-1 text-emerald-400" />
          <span className="text-[10px] font-semibold">Pop Subjek</span>
          <span className="text-[8px] text-emerald-400/70">+0.45 EV • Jernih</span>
        </button>

        <button
          onClick={() => applyQuickMaskRecipe('darken_bg')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 text-blue-300 transition-all text-center"
        >
          <Layers className="w-4 h-4 mb-1 text-blue-400" />
          <span className="text-[10px] font-semibold">Gelapkan Latar</span>
          <span className="text-[8px] text-blue-400/70">-0.4 EV • Soft</span>
        </button>

        <button
          onClick={() => applyQuickMaskRecipe('dramatic_sky')}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 transition-all text-center"
        >
          <CloudRain className="w-4 h-4 mb-1 text-amber-400" />
          <span className="text-[10px] font-semibold">Langit Dramatis</span>
          <span className="text-[8px] text-amber-400/70">Dehaze • Sat Biru</span>
        </button>
      </div>

      {/* Layer Tabs */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Daftar Masking Aktif
        </div>
        <div className="space-y-1">
          {masks.map((mask) => {
            const isSelected = mask.id === activeMaskId;
            return (
              <div
                key={mask.id}
                onClick={() => setActiveMaskId(mask.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/70 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getTargetIcon(mask.type)}
                  <div>
                    <div className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {mask.name}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Sensitivitas: {mask.confidence}% • Feather: {mask.feather}px
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleMaskEnabled(mask.id, e)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      mask.enabled ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {mask.enabled ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Mask Controls */}
      {activeMask && (
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[12px] font-bold text-amber-400 flex items-center gap-1.5">
              {getTargetIcon(activeMask.type)}
              {activeMask.name}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateActiveMask((m) => ({ ...m, invert: !m.invert }))}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                  activeMask.invert
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Balikkan area seleksi (Invert Mask)"
              >
                Invert
              </button>
              <button
                onClick={() =>
                  updateActiveMask((m) => ({
                    ...m,
                    adjustments: {
                      exposure: 0,
                      temperature: 0,
                      tint: 0,
                      contrast: 0,
                      highlights: 0,
                      shadows: 0,
                      clarity: 0,
                      dehaze: 0,
                      saturation: 0,
                      sharpness: 0,
                      blur: 0,
                    },
                  }))
                }
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Reset setelan mask ini"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mask Parameters: Confidence & Feather */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Sensitivitas AI:</span>
                <span className="font-mono-num text-amber-400">{activeMask.confidence}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={activeMask.confidence}
                onChange={(e) => updateActiveMask((m) => ({ ...m, confidence: Number(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Kehalusan Tepi (Feather):</span>
                <span className="font-mono-num text-amber-400">{activeMask.feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={activeMask.feather}
                onChange={(e) => updateActiveMask((m) => ({ ...m, feather: Number(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Mask Adjustment Sliders */}
          <div className="space-y-2.5 pt-1">
            {/* Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Eksposur Khusus Masker</span>
                <span className="font-mono-num text-amber-400">
                  {activeMask.adjustments.exposure > 0 ? `+${activeMask.adjustments.exposure.toFixed(2)}` : activeMask.adjustments.exposure.toFixed(2)} EV
                </span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.05"
                value={activeMask.adjustments.exposure}
                onChange={(e) =>
                  updateActiveMask((m) => ({
                    ...m,
                    adjustments: { ...m.adjustments, exposure: Number(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Suhu Warna (WB)</span>
                <span className="font-mono-num text-amber-400">{activeMask.adjustments.temperature}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={activeMask.adjustments.temperature}
                onChange={(e) =>
                  updateActiveMask((m) => ({
                    ...m,
                    adjustments: { ...m.adjustments, temperature: Number(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Kontras Masker</span>
                <span className="font-mono-num text-amber-400">{activeMask.adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={activeMask.adjustments.contrast}
                onChange={(e) =>
                  updateActiveMask((m) => ({
                    ...m,
                    adjustments: { ...m.adjustments, contrast: Number(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Saturasi</span>
                <span className="font-mono-num text-amber-400">{activeMask.adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={activeMask.adjustments.saturation}
                onChange={(e) =>
                  updateActiveMask((m) => ({
                    ...m,
                    adjustments: { ...m.adjustments, saturation: Number(e.target.value) },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Clarity / Dehaze */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Kejernihan:</span>
                  <span className="font-mono-num text-amber-400">{activeMask.adjustments.clarity}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={activeMask.adjustments.clarity}
                  onChange={(e) =>
                    updateActiveMask((m) => ({
                      ...m,
                      adjustments: { ...m.adjustments, clarity: Number(e.target.value) },
                    }))
                  }
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Dehaze:</span>
                  <span className="font-mono-num text-amber-400">{activeMask.adjustments.dehaze}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={activeMask.adjustments.dehaze}
                  onChange={(e) =>
                    updateActiveMask((m) => ({
                      ...m,
                      adjustments: { ...m.adjustments, dehaze: Number(e.target.value) },
                    }))
                  }
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
