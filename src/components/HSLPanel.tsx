import React, { useState } from 'react';
import { HSLSettings } from '../types/preset';

interface HSLPanelProps {
  hsl: HSLSettings;
  onChange: (newHsl: HSLSettings) => void;
}

const COLOR_KEYS = [
  { key: 'red', name: 'Merah', color: '#ef4444' },
  { key: 'orange', name: 'Oranye (Kulit)', color: '#f97316' },
  { key: 'yellow', name: 'Kuning', color: '#eab308' },
  { key: 'green', name: 'Hijau (Daun)', color: '#22c55e' },
  { key: 'aqua', name: 'Aqua (Air)', color: '#06b6d4' },
  { key: 'blue', name: 'Biru (Langit)', color: '#3b82f6' },
  { key: 'purple', name: 'Ungu', color: '#a855f7' },
  { key: 'magenta', name: 'Magenta', color: '#ec4899' },
] as const;

export const HSLPanel: React.FC<HSLPanelProps> = ({ hsl, onChange }) => {
  const [activeTab, setActiveTab] = useState<'hue' | 'saturation' | 'luminance'>('saturation');

  const handleChannelChange = (channel: keyof HSLSettings, field: 'hue' | 'saturation' | 'luminance', val: number) => {
    onChange({
      ...hsl,
      [channel]: {
        ...hsl[channel],
        [field]: val,
      },
    });
  };

  const handleResetChannel = (channel: keyof HSLSettings) => {
    onChange({
      ...hsl,
      [channel]: { hue: 0, saturation: 0, luminance: 0 },
    });
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher: Hue, Saturation, Luminance */}
      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
        {(['hue', 'saturation', 'luminance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 rounded text-center font-medium transition-all ${
              activeTab === tab ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'hue' ? 'Rona (Hue)' : tab === 'saturation' ? 'Saturasi' : 'Luminans'}
          </button>
        ))}
      </div>

      {/* 8 Color Channel Sliders */}
      <div className="space-y-2.5">
        {COLOR_KEYS.map(({ key, name, color }) => {
          const val = hsl[key][activeTab];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-slate-300">{name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-num text-[11px] text-amber-400 w-8 text-right">
                    {val > 0 ? `+${val}` : val}
                  </span>
                  {val !== 0 && (
                    <button
                      onClick={() => handleChannelChange(key, activeTab, 0)}
                      className="text-[9px] text-slate-500 hover:text-white"
                      title="Reset slider ini"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={val}
                onChange={(e) => handleChannelChange(key, activeTab, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
