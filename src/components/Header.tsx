import React, { useRef } from 'react';
import { SAMPLE_PHOTOS } from '../utils/sampleImages';
import { Camera, FolderOpen, Download, Bookmark, Sparkles, Image as ImageIcon, CheckCircle, RefreshCcw } from 'lucide-react';

interface HeaderProps {
  currentSampleId: string;
  onSelectSample: (sampleId: string) => void;
  onFileUpload: (file: File) => void;
  onOpenExportModal: () => void;
  onOpenSavePresetModal: () => void;
  customPhotoName: string | null;
  photoFormatInfo?: string | null;
  photoResolution?: { width: number; height: number } | null;
  isLoadingFile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSampleId,
  onSelectSample,
  onFileUpload,
  onOpenExportModal,
  onOpenSavePresetModal,
  customPhotoName,
  photoFormatInfo,
  photoResolution,
  isLoadingFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  const mpDisplay = photoResolution
    ? ((photoResolution.width * photoResolution.height) / 1000000).toFixed(1)
    : '24.2';

  return (
    <header className="bg-[#0b0e14] border-b border-slate-800/80 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 select-none shrink-0 z-30">
      {/* Hidden Universal File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.tiff,.tif,.bmp,.gif,.svg,.heic,.heif,.nef,.nrw,.dng,.cr2,.arw,.raw"
        onChange={handleFileInputChange}
        className="hidden"
        id="photo-file-input"
      />

      {/* Brand & Gear Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0 font-extrabold text-base">
          <Camera className="w-5 h-5 text-slate-950" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
              Nikon D3400 + Tokina 11-16mm
            </h1>
            <span className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold text-amber-300 font-mono-num items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              1,000 PRESET
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
            <span className="font-mono-num text-slate-300">{mpDisplay} MP</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">Tokina f/2.8 PRO</span>
            <span className="hidden sm:inline">•</span>
            {customPhotoName ? (
              <span className="text-slate-300 truncate max-w-[120px] sm:max-w-[180px]">
                {customPhotoName}
              </span>
            ) : (
              <span className="hidden sm:inline text-slate-400">Sample Aktif</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Touch-optimized for Android Mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Sample Switcher (Dropdown) */}
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-0.5 text-xs">
          <ImageIcon className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <select
            value={currentSampleId}
            onChange={(e) => onSelectSample(e.target.value)}
            className="bg-transparent text-slate-200 text-[11px] font-medium focus:outline-none pr-1 py-1 cursor-pointer"
            title="Pilih foto contoh Nikon Tokina"
          >
            {SAMPLE_PHOTOS.map((sample) => (
              <option key={sample.id} value={sample.id} className="bg-slate-900 text-slate-200">
                {sample.title}
              </option>
            ))}
          </select>
        </div>

        {/* PRIMARY TOUCH BUTTON: MASUKAN FOTO */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoadingFile}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-1.5 min-h-[42px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 active:from-amber-400 active:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title="Buka foto dari galeri atau kamera Android (Semua format didukung: JPG, PNG, TIFF, HEIC, RAW .NEF, DNG, dll)"
        >
          {isLoadingFile ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FolderOpen className="w-4 h-4 text-slate-950 shrink-0" />
          )}
          <span className="whitespace-nowrap">
            {isLoadingFile ? 'MEMUAT...' : 'MASUKAN FOTO'}
          </span>
        </button>

        {/* Save Preset Button (Desktop only, mobile accesses via tools) */}
        <button
          onClick={onOpenSavePresetModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Simpan sebagai preset baru"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Preset</span>
        </button>

        {/* Export Button: Simpan Kualitas Terbaik */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-1.5 min-h-[42px] sm:min-h-[38px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Simpan foto dengan kualitas tertinggi ke galeri (PNG Lossless, JPEG 100%, XMP, LUT)"
        >
          <Download className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">SIMPAN</span>
        </button>
      </div>
    </header>
  );
};
