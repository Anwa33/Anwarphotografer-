import { MaskLayer, MaskTarget } from '../types/preset';

export interface MaskBitmap {
  width: number;
  height: number;
  data: Uint8Array; // 0 to 255
}

// Generate intelligent Subject Mask using Saliency & Contrast analysis
export function computeSubjectMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  confidenceThreshold: number = 65,
  featherRadius: number = 25
): MaskBitmap {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const mask = new Uint8Array(width * height);

  // Downsampled analysis grid for fast real-time performance
  const step = 2;
  const cx = width / 2;
  const cy = height * 0.58; // Saliency centered slightly lower for wide angle ground subjects
  const maxDist = Math.hypot(width / 2, height / 2);

  // Sample perimeter colors to estimate background palette
  let bgR = 0, bgG = 0, bgB = 0;
  let bgSamples = 0;
  // Sample top edge and corners
  for (let x = 0; x < width; x += 10) {
    const idx = (0 * width + x) * 4;
    bgR += src[idx];
    bgG += src[idx + 1];
    bgB += src[idx + 2];
    bgSamples++;
  }
  bgR /= bgSamples;
  bgG /= bgSamples;
  bgB /= bgSamples;

  const threshold = (confidenceThreshold / 100) * 255;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];

      // Distance from background average
      const colorDiff = Math.hypot(r - bgR, g - bgG, b - bgB);

      // Distance from center of attention (Gaussian center prior)
      const dist = Math.hypot(x - cx, y - cy);
      const spatialWeight = Math.max(0.1, 1.0 - (dist / (maxDist * 0.85)));

      // Saliency score
      const saliency = colorDiff * spatialWeight * 1.6;

      const val = saliency > threshold ? Math.min(255, Math.round((saliency - threshold) * 3.5 + 160)) : 0;

      // Fill step box
      for (let dy = 0; dy < step && y + dy < height; dy++) {
        for (let dx = 0; dx < step && x + dx < width; dx++) {
          mask[(y + dy) * width + (x + dx)] = val;
        }
      }
    }
  }

  // Feather mask edges if requested
  return featherRadius > 0 ? boxBlurMask({ width, height, data: mask }, Math.min(15, Math.round(featherRadius / 3))) : { width, height, data: mask };
}

// Generate Sky Mask
export function computeSkyMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  confidenceThreshold: number = 70,
  featherRadius: number = 30
): MaskBitmap {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const mask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    // Sky is predominantly in the upper 70% of ultra-wide frame
    const heightFactor = Math.max(0, 1.0 - (y / (height * 0.72)));
    if (heightFactor <= 0) continue;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // Sky characteristics: high luminance, or blue dominant (day), or orange sunset
      const isBlueSky = (b > r && b > g * 0.9) || (b > 110 && luma > 100);
      const isSunsetSky = (r > 130 && g > 70 && b < r);
      const isAstroSky = (luma < 60 && y < height * 0.65);

      let skyScore = 0;
      if (isBlueSky || isSunsetSky || isAstroSky) {
        skyScore = 255 * heightFactor;
      }

      mask[y * width + x] = Math.round(skyScore);
    }
  }

  return featherRadius > 0 ? boxBlurMask({ width, height, data: mask }, Math.min(20, Math.round(featherRadius / 2))) : { width, height, data: mask };
}

// Generate Radial Gradient Mask
export function computeRadialMask(
  width: number,
  height: number,
  centerX: number = 0.5,
  centerY: number = 0.5,
  radiusX: number = 0.4,
  radiusY: number = 0.4,
  feather: number = 50
): MaskBitmap {
  const mask = new Uint8Array(width * height);
  const cx = width * centerX;
  const cy = height * centerY;
  const rx = width * radiusX;
  const ry = height * radiusY;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const normDist = Math.hypot(dx, dy);

      let val = 0;
      if (normDist <= 1.0) {
        const t = (1.0 - normDist) / ((feather / 100) + 0.05);
        val = Math.min(255, Math.max(0, Math.round(t * 255)));
      }
      mask[y * width + x] = val;
    }
  }

  return { width, height, data: mask };
}

// Generate Linear Gradient Mask
export function computeLinearMask(
  width: number,
  height: number,
  position: number = 0.45,
  feather: number = 40
): MaskBitmap {
  const mask = new Uint8Array(width * height);
  const splitY = height * position;
  const span = height * (feather / 100) * 0.5 + 10;

  for (let y = 0; y < height; y++) {
    let val = 0;
    if (y < splitY - span) {
      val = 255;
    } else if (y > splitY + span) {
      val = 0;
    } else {
      const t = (splitY + span - y) / (span * 2);
      val = Math.round(t * 255);
    }

    const rowVal = Math.min(255, Math.max(0, val));
    for (let x = 0; x < width; x++) {
      mask[y * width + x] = rowVal;
    }
  }

  return { width, height, data: mask };
}

// Fast Box Blur for mask feathering
export function boxBlurMask(bitmap: MaskBitmap, radius: number): MaskBitmap {
  if (radius <= 0) return bitmap;
  const { width, height, data } = bitmap;
  const temp = new Uint8Array(width * height);
  const result = new Uint8Array(width * height);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    let sum = 0;
    const yOffset = y * width;
    for (let x = -radius; x <= radius; x++) {
      const px = Math.min(width - 1, Math.max(0, x));
      sum += data[yOffset + px];
    }
    for (let x = 0; x < width; x++) {
      temp[yOffset + x] = Math.round(sum / (radius * 2 + 1));
      const nextX = Math.min(width - 1, x + radius + 1);
      const prevX = Math.max(0, x - radius);
      sum += data[yOffset + nextX] - data[yOffset + prevX];
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      const py = Math.min(height - 1, Math.max(0, y));
      sum += temp[py * width + x];
    }
    for (let y = 0; y < height; y++) {
      result[y * width + x] = Math.round(sum / (radius * 2 + 1));
      const nextY = Math.min(height - 1, y + radius + 1);
      const prevY = Math.max(0, y - radius);
      sum += temp[nextY * width + x] - temp[prevY * width + x];
    }
  }

  return { width, height, data: result };
}

// Invert mask data
export function invertMask(bitmap: MaskBitmap): MaskBitmap {
  const result = new Uint8Array(bitmap.width * bitmap.height);
  for (let i = 0; i < bitmap.data.length; i++) {
    result[i] = 255 - bitmap.data[i];
  }
  return { width: bitmap.width, height: bitmap.height, data: result };
}

// Render Red Rubylith Mask Overlay onto preview canvas
export function renderMaskOverlay(
  targetCtx: CanvasRenderingContext2D,
  mask: MaskBitmap,
  overlayColor: string = 'rgba(239, 68, 68, 0.55)'
) {
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = mask.width;
  overlayCanvas.height = mask.height;
  const oCtx = overlayCanvas.getContext('2d');
  if (!oCtx) return;

  const imgData = oCtx.createImageData(mask.width, mask.height);
  const d = imgData.data;

  // Red rubylith with alpha matching mask density
  for (let i = 0; i < mask.data.length; i++) {
    const alpha = mask.data[i];
    if (alpha > 5) {
      const idx = i * 4;
      d[idx] = 239;     // Red
      d[idx + 1] = 68;  // Green
      d[idx + 2] = 68;  // Blue
      d[idx + 3] = Math.round(alpha * 0.65); // Semi-transparent
    }
  }

  oCtx.putImageData(imgData, 0, 0);
  targetCtx.drawImage(overlayCanvas, 0, 0);
}
