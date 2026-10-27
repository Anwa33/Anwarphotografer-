import React, { useState, useMemo } from 'react';
import { Preset } from '../types/preset';
import { PRESET_CATEGORIES } from '../data/presetGenerator';
import { Search, Star, Download, Sparkles, Filter, Check, Eye } from 'lucide-react';
import { exportPresetXMP } from '../utils/exporters';

interface PresetPanelProps {
  presets: Preset[];
  activePresetId: string | null;
  onSelectPreset: (preset: Preset) => void;
  onToggleFavorite: (presetId: string) => void;
}

export const PresetPanel: React.FC<PresetPanelProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedFocal, setSelectedFocal] = useState<'all' | '11' | '14' | '16'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Filter 1000 presets fast
  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      if (onlyFavorites && !p.isFavorite) return false;
      if (selectedCategory !== 'all' && p.subCategory !== selectedCategory) return false;
      if (selectedFocal !== 'all' && p.tokinaOptimizedFocal !== Number(selectedFocal)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesProfile = p.nikonProfile.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesTags && !matchesProfile) return false;
      }

      return true;
    });
  }, [presets, searchQuery, selectedCategory, onlyFavorites, selectedFocal]);

  const totalPages = Math.ceil(filteredPresets.length / pageSize) || 1;
  const paginatedPresets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPresets.slice(start, start + pageSize);
  }, [filteredPresets, page]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header Stat & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Galeri 1,000 Preset Tokina & Nikon
            </h3>
          </div>
          <span className="text-[11px] font-mono-num text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
            {filteredPresets.length} dari 1,000 Preset
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari preset (Astro, Bromo, Portra, Teal Orange, 11mm...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Quick Filter Bar: All / Favorites / Focal Lengths */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-medium whitespace-nowrap transition-all ${
              onlyFavorites
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-slate-950' : 'text-amber-400'}`} />
            <span>Favorit Saya</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5"></div>

          {(['all', '11', '14', '16'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setSelectedFocal(f);
                setPage(1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono-num border whitespace-nowrap transition-all ${
                selectedFocal === f
                  ? 'bg-slate-700 border-slate-600 text-white font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Semua Focal' : `Tokina ${f}mm`}
            </button>
          ))}
        </div>

        {/* 20 Categories Pills Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-thin">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua (1,000)
          </button>
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name.split('&')[0].trim()} (50)
            </button>
          ))}
        </div>
      </div>

      {/* Preset Grid Cards */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[360px]">
        {paginatedPresets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs">Tidak ada preset yang cocok dengan pencarian.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyFavorites(false);
                setSelectedFocal('all');
              }}
              className="text-[11px] text-amber-400 underline hover:text-amber-300"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {paginatedPresets.map((preset) => {
              const isActive = preset.id === activePresetId;
              const shadowHue = preset.settings.colorGrading.shadows.hue;
              const hlHue = preset.settings.colorGrading.highlights.hue;

              return (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`group relative p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isActive
                      ? 'bg-amber-950/20 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Color Swatch Bar */}
                  <div
                    className="h-1.5 w-full rounded-full mb-2 opacity-85 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, hsl(${shadowHue}, 70%, 35%) 0%, hsl(${hlHue}, 80%, 65%) 100%)`,
                    }}
                  />

                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                          {preset.name}
                        </span>
                        {isActive && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">{preset.category}</div>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(preset.id);
                      }}
                      className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                      title={preset.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          preset.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Metadata Chips: Nikon Profile + Tokina Focal */}
                  <div className="flex items-center gap-1.5 mt-2 text-[9px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono-num">
                      Tokina {preset.tokinaOptimizedFocal}mm
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-900/40 text-blue-300">
                      Nikon {preset.nikonProfile}
                    </span>
                    <span className="ml-auto font-mono-num text-slate-400">
                      {preset.settings.exposure > 0 ? `+${preset.settings.exposure}` : preset.settings.exposure} EV
                    </span>
                  </div>

                  {/* Action Bar on Hover / Active */}
                  <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      {isActive ? (
                        <>
                          <Check className="w-3 h-3 text-amber-400" />
                          <span>Preset Aktif</span>
                        </>
                      ) : (
                        <span className="text-slate-400 group-hover:text-white">Klik untuk terapkan</span>
                      )}
                    </span>

                    {/* Direct .XMP Export button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportPresetXMP(preset);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-mono-num"
                      title="Download file preset .XMP untuk Adobe Lightroom"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>.XMP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
          >
            ← Sebelumnya
          </button>
          <span className="font-mono-num">
            Halaman {page} dari {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
};
