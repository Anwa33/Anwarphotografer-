import React, { useState } from 'react';
import { AdjustmentSettings, NikonPictureControl, Preset } from '../types/preset';
import { PRESET_CATEGORIES } from '../data/presetGenerator';
import { Bookmark, Sparkles, X, Check } from 'lucide-react';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdjustmentSettings;
  onSave: (newPreset: Preset) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0].id);
  const [nikonProfile, setNikonProfile] = useState<NikonPictureControl>('Landscape');
  const [focal, setFocal] = useState<11 | 14 | 16>(settings.lens.focalLength || 11);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catObj = PRESET_CATEGORIES.find((c) => c.id === category) || PRESET_CATEGORIES[0];
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: catObj.name,
      subCategory: catObj.id,
      nikonProfile,
      tokinaOptimizedFocal: focal,
      description: description.trim() || `Preset kustom Nikon D3400 + Tokina 11-16mm buatan Anda.`,
      tags: ['Kustom', `${focal}mm`, 'Nikon D3400', 'Tokina 11-16mm'],
      isFavorite: true,
      settings: JSON.parse(JSON.stringify(settings)),
    };

    onSave(newPreset);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Simpan Preset Kustom Baru
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Simpan racikan setelan saat ini ke dalam pustaka preset Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Preset:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sunset Pantai Kuta 11mm Ultra-Warm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.split('&')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Profil Warna Nikon:</label>
              <select
                value={nikonProfile}
                onChange={(e) => setNikonProfile(e.target.value as NikonPictureControl)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="Landscape">Nikon Landscape</option>
                <option value="Vivid">Nikon Vivid</option>
                <option value="Neutral">Nikon Neutral</option>
                <option value="Standard">Nikon Standard</option>
                <option value="Portrait">Nikon Portrait</option>
                <option value="Flat">Nikon Flat</option>
                <option value="Monochrome">Nikon Monochrome</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Panjang Fokus Tokina:</label>
            <div className="grid grid-cols-3 gap-2">
              {[11, 14, 16].map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFocal(f as 11 | 14 | 16)}
                  className={`py-1.5 rounded-lg border text-center font-mono-num ${
                    focal === f
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}mm
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan / Deskripsi (Opsional):</label>
            <textarea
              rows={2}
              placeholder="Catatan pengambilan foto, waktu pencahayaan, atau filter ND..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Preset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
