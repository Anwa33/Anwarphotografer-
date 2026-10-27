import UTIF from 'utif';
import heic2any from 'heic2any';

export interface DecodedPhotoResult {
  image: HTMLImageElement;
  fileName: string;
  fileFormat: string;
  width: number;
  height: number;
  fileSizeFormatted: string;
}

// Format bytes into human readable format
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Scans an ArrayBuffer for embedded JPEG markers (0xFF, 0xD8 to 0xFF, 0xD9)
// Nikon NEF, DNG, and other camera RAW files embed full or high-res preview JPEGs
export function extractEmbeddedJpeg(buffer: ArrayBuffer): Blob | null {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  let candidates: { start: number; end: number; size: number }[] = [];

  let start = -1;
  for (let i = 0; i < len - 1; i++) {
    // Check for JPEG SOI (0xFF, 0xD8)
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8) {
      // Confirm standard JPEG SOI followed by 0xFF (e.g. 0xFFE0, 0xFFE1, 0xFFDB)
      if (i + 2 < len && bytes[i + 2] === 0xff) {
        start = i;
        // Search for matching EOI (0xFF, 0xD9)
        for (let j = start + 4; j < len - 1; j++) {
          if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
            const size = j + 2 - start;
            // Filter out tiny thumbnails (< 20KB) if larger ones exist
            if (size > 20480) {
              candidates.push({ start, end: j + 2, size });
            }
            i = j + 1;
            break;
          }
        }
      }
    }
  }

  if (candidates.length === 0) {
    // Retry with any JPEG regardless of size
    for (let i = 0; i < len - 1; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8) {
        for (let j = i + 4; j < len - 1; j++) {
          if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
            candidates.push({ start: i, end: j + 2, size: j + 2 - i });
            i = j + 1;
            break;
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Pick the largest JPEG preview found (highest resolution)
  candidates.sort((a, b) => b.size - a.size);
  const best = candidates[0];
  const jpegBytes = bytes.slice(best.start, best.end);
  return new Blob([jpegBytes], { type: 'image/jpeg' });
}

// Decode TIFF / TIF using UTIF.js
export async function decodeTiff(buffer: ArrayBuffer): Promise<Blob> {
  const ifds = UTIF.decode(buffer);
  if (!ifds || ifds.length === 0) {
    throw new Error('Format TIFF tidak valid atau tidak memiliki IFD.');
  }

  UTIF.decodeImage(buffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const width = ifds[0].width;
  const height = ifds[0].height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal menginisialisasi canvas untuk TIFF.');

  const imgData = ctx.createImageData(width, height);
  imgData.data.set(rgba);
  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gagal mengonversi data TIFF ke Blob.'));
    }, 'image/png');
  });
}

// Decode HEIC / HEIF using heic2any
export async function decodeHeic(file: File | Blob): Promise<Blob> {
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.98,
  });

  if (Array.isArray(converted)) {
    return converted[0];
  }
  return converted;
}

// Create an HTMLImageElement from a Blob
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Note: we can keep url or revoke after draw
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

// Master Decoder: Supports ALL photo formats:
// JPG, JPEG, PNG, WEBP, AVIF, BMP, GIF, SVG, ICO, TIFF, TIF, HEIC, HEIF,
// Nikon RAW (.NEF, .NRW), Adobe DNG (.DNG), and camera RAW (.CR2, .ARW, .RAW)
export async function decodeAnyPhotoFile(file: File): Promise<DecodedPhotoResult> {
  const name = file.name || 'foto_tanpa_nama';
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const mime = file.type.toLowerCase();
  const sizeFormatted = formatBytes(file.size);

  let detectedFormat = 'Foto';
  let targetBlob: Blob | null = null;

  // 1. Check for Nikon RAW (.NEF, .NRW) & Universal RAW (.DNG, .CR2, .ARW, .RAW)
  if (
    ext === '.nef' ||
    ext === '.nrw' ||
    ext === '.dng' ||
    ext === '.cr2' ||
    ext === '.arw' ||
    ext === '.raw' ||
    mime.includes('raw') ||
    mime.includes('nef')
  ) {
    detectedFormat = ext === '.nef' || ext === '.nrw' ? 'Nikon RAW (.NEF)' : `Camera RAW (${ext.toUpperCase()})`;
    try {
      const buffer = await file.arrayBuffer();
      const extracted = extractEmbeddedJpeg(buffer);
      if (extracted) {
        targetBlob = extracted;
      } else {
        // Fallback: try UTIF (since many RAW formats like DNG/NEF are TIFF-based)
        try {
          targetBlob = await decodeTiff(buffer);
        } catch {
          throw new Error(`Tidak dapat mengekstrak pratinjau resolusi tinggi dari file ${detectedFormat}.`);
        }
      }
    } catch (err: any) {
      throw new Error(`Gagal membaca file ${detectedFormat}: ${err.message || 'Format tidak didukung'}`);
    }
  }

  // 2. Check for TIFF (.TIF, .TIFF)
  else if (ext === '.tif' || ext === '.tiff' || mime.includes('tiff') || mime.includes('tif')) {
    detectedFormat = 'TIFF Pro';
    try {
      const buffer = await file.arrayBuffer();
      targetBlob = await decodeTiff(buffer);
    } catch (err: any) {
      // Fallback: try embedded JPEG
      const buffer = await file.arrayBuffer();
      const extracted = extractEmbeddedJpeg(buffer);
      if (extracted) {
        targetBlob = extracted;
      } else {
        throw new Error(`Gagal membaca file TIFF: ${err.message || 'Struktur TIFF rusak'}`);
      }
    }
  }

  // 3. Check for HEIC / HEIF (.HEIC, .HEIF)
  else if (
    ext === '.heic' ||
    ext === '.heif' ||
    mime.includes('heic') ||
    mime.includes('heif')
  ) {
    detectedFormat = 'Apple HEIC/HEIF';
    try {
      targetBlob = await decodeHeic(file);
    } catch (err: any) {
      throw new Error(`Gagal mendekode gambar HEIC: ${err.message || 'Codec HEIC gagal'}`);
    }
  }

  // 4. Standard Formats: JPEG, PNG, WEBP, AVIF, BMP, GIF, SVG
  else {
    if (ext === '.jpg' || ext === '.jpeg') detectedFormat = 'JPEG';
    else if (ext === '.png') detectedFormat = 'PNG';
    else if (ext === '.webp') detectedFormat = 'WebP';
    else if (ext === '.avif') detectedFormat = 'AVIF';
    else if (ext === '.bmp') detectedFormat = 'BMP';
    else if (ext === '.gif') detectedFormat = 'GIF';
    else if (ext === '.svg') detectedFormat = 'SVG Vector';
    else detectedFormat = ext ? ext.slice(1).toUpperCase() : 'Gambar';

    targetBlob = file;
  }

  // Load into HTMLImageElement
  try {
    const image = await loadImageFromBlob(targetBlob);
    return {
      image,
      fileName: name,
      fileFormat: detectedFormat,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      fileSizeFormatted: sizeFormatted,
    };
  } catch {
    // If standard load failed, attempt RAW JPEG extraction as ultimate universal fallback
    try {
      const buffer = await file.arrayBuffer();
      const fallbackJpeg = extractEmbeddedJpeg(buffer);
      if (fallbackJpeg) {
        const image = await loadImageFromBlob(fallbackJpeg);
        return {
          image,
          fileName: name,
          fileFormat: `${detectedFormat} (Decoded)`,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          fileSizeFormatted: sizeFormatted,
        };
      }
    } catch {
      // Pass through
    }
    throw new Error(`Browser tidak dapat menampilkan format foto ini: ${name}. Pastikan file merupakan gambar yang valid.`);
  }
}
