import { AdjustmentSettings, GeometrySettings, MaskLayer } from '../types/preset';
import { MaskBitmap, computeSubjectMask, computeSkyMask, computeRadialMask, computeLinearMask } from './maskEngine';

// Precomputed lookup table for Tone Curve
export function buildCurveLUT(curvePoints: { x: number; y: number }[]): Uint8Array {
  const lut = new Uint8Array(256);
  if (!curvePoints || curvePoints.length < 2) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Linear interpolation between control points
  const sorted = [...curvePoints].sort((a, b) => a.x - b.x);
  let ptIdx = 0;
  for (let x = 0; x < 256; x++) {
    while (ptIdx < sorted.length - 1 && sorted[ptIdx + 1].x < x) {
      ptIdx++;
    }
    const p1 = sorted[ptIdx];
    const p2 = sorted[Math.min(sorted.length - 1, ptIdx + 1)];
    if (p1.x === p2.x) {
      lut[x] = Math.max(0, Math.min(255, Math.round(p1.y)));
    } else {
      const t = (x - p1.x) / (p2.x - p1.x);
      const val = p1.y + t * (p2.y - p1.y);
      lut[x] = Math.max(0, Math.min(255, Math.round(val)));
    }
  }
  return lut;
}

// Convert RGB to HSL (0-1 ranges)
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Convert HSL back to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (h % 360 + 360) % 360;
  h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Map color hue angle to 8 HSL channels
function getHSLChannelKey(hue: number): keyof AdjustmentSettings['hsl'] {
  if (hue >= 345 || hue < 15) return 'red';
  if (hue >= 15 && hue < 45) return 'orange';
  if (hue >= 45 && hue < 75) return 'yellow';
  if (hue >= 75 && hue < 165) return 'green';
  if (hue >= 165 && hue < 195) return 'aqua';
  if (hue >= 195 && hue < 255) return 'blue';
  if (hue >= 255 && hue < 290) return 'purple';
  return 'magenta';
}

// Main rendering function that takes source canvas/image and applies full photographic pipeline
export function processImage(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  settings: AdjustmentSettings,
  masks: MaskLayer[] = [],
  geometry?: GeometrySettings
) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  targetCanvas.width = width;
  targetCanvas.height = height;
  const tCtx = targetCanvas.getContext('2d');
  const sCtx = sourceCanvas.getContext('2d');
  if (!tCtx || !sCtx) return;

  // Apply geometry (rotation & flip) if specified
  tCtx.save();
  tCtx.clearRect(0, 0, width, height);

  if (geometry) {
    tCtx.translate(width / 2, height / 2);
    if (geometry.rotation !== 0) {
      tCtx.rotate((geometry.rotation * Math.PI) / 180);
    }
    if (geometry.flipH || geometry.flipV) {
      tCtx.scale(geometry.flipH ? -1 : 1, geometry.flipV ? -1 : 1);
    }
    tCtx.drawImage(sourceCanvas, -width / 2, -height / 2);
  } else {
    tCtx.drawImage(sourceCanvas, 0, 0);
  }
  tCtx.restore();

  const imgData = tCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Precompute Curve LUTs
  const rgbCurveLut = buildCurveLUT(settings.curve.rgb);
  const rCurveLut = buildCurveLUT(settings.curve.red);
  const gCurveLut = buildCurveLUT(settings.curve.green);
  const bCurveLut = buildCurveLUT(settings.curve.blue);

  // Tokina 11-16mm Lens profile parameters
  const lens = settings.lens;
  const hasLensCorr = lens.enabled && (lens.distortionCorrection !== 0 || lens.vignetteRemoval !== 0 || lens.chromaticAberrationFix !== 0);
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.hypot(cx, cy);

  // Compute active masks
  const computedMasks: { mask: MaskBitmap; layer: MaskLayer }[] = [];
  for (const m of masks) {
    if (!m.enabled) continue;
    let bmap: MaskBitmap | null = null;
    if (m.type === 'subject') {
      bmap = computeSubjectMask(sCtx, width, height, m.confidence, m.feather);
    } else if (m.type === 'background') {
      const sub = computeSubjectMask(sCtx, width, height, m.confidence, m.feather);
      const inv = new Uint8Array(width * height);
      for (let i = 0; i < sub.data.length; i++) inv[i] = 255 - sub.data[i];
      bmap = { width, height, data: inv };
    } else if (m.type === 'sky') {
      bmap = computeSkyMask(sCtx, width, height, m.confidence, m.feather);
    } else if (m.type === 'radial') {
      bmap = computeRadialMask(width, height, m.radialCenterX ?? 0.5, m.radialCenterY ?? 0.5, m.radialRadiusX ?? 0.4, m.radialRadiusY ?? 0.4, m.feather);
    } else if (m.type === 'linear') {
      bmap = computeLinearMask(width, height, m.linearPosition ?? 0.45, m.feather);
    }

    if (bmap) {
      if (m.invert) {
        for (let i = 0; i < bmap.data.length; i++) bmap.data[i] = 255 - bmap.data[i];
      }
      computedMasks.push({ mask: bmap, layer: m });
    }
  }

  // Pre-calculate exposure multiplier: 2^(EV)
  const expMultiplier = Math.pow(2, settings.exposure * 0.035);
  const contrastFactor = (settings.contrast + 100) / 100;
  const tempOffset = settings.temperature;
  const tintOffset = settings.tint;
  const clarityFactor = settings.clarity * 0.005;
  const dehazeFactor = settings.dehaze * 0.004;

  // Pixel Loop
  for (let y = 0; y < height; y++) {
    const yDist = y - cy;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // 1. Tokina 11-16mm Lens Vignette Recovery & Distortion Correction
      if (hasLensCorr) {
        const xDist = x - cx;
        const distFromCenter = Math.hypot(xDist, yDist);
        const normDist = distFromCenter / maxRadius;

        // Vignette recovery: Tokina 11mm f/2.8 exhibits corner light falloff
        if (lens.vignetteRemoval > 0) {
          const vigBoost = 1.0 + (lens.vignetteRemoval * 0.007) * Math.pow(normDist, 2.2);
          r *= vigBoost;
          g *= vigBoost;
          b *= vigBoost;
        }

        // Chromatic Aberration & Purple Fringe fix for ultra-wide Tokina corners
        if (lens.chromaticAberrationFix > 0 && normDist > 0.6) {
          const caIntensity = (lens.chromaticAberrationFix / 100) * (normDist - 0.6) * 1.5;
          // Suppress purple fringe (excess of R & B over G)
          if (r > g && b > g) {
            const avgGreen = g;
            r = r * (1 - caIntensity) + avgGreen * caIntensity;
            b = b * (1 - caIntensity) + avgGreen * caIntensity;
          }
        }
      }

      // 2. Exposure & White Balance (Daylight / Kelvin Shift & Tint)
      r *= expMultiplier;
      g *= expMultiplier;
      b *= expMultiplier;

      if (tempOffset !== 0) {
        if (tempOffset > 0) {
          // Warm up (golden glow)
          r += tempOffset * 0.8;
          b -= tempOffset * 0.6;
        } else {
          // Cool down (cobalt / blue hour)
          b += Math.abs(tempOffset) * 0.85;
          r -= Math.abs(tempOffset) * 0.5;
        }
      }
      if (tintOffset !== 0) {
        // Magenta / Green tint
        g -= tintOffset * 0.5;
        r += tintOffset * 0.25;
        b += tintOffset * 0.25;
      }

      // 3. Highlights & Shadows Recovery
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (settings.highlights !== 0 && luma > 140) {
        const hlFactor = (luma - 140) / 115;
        const hlShift = settings.highlights * 0.6 * hlFactor;
        r += hlShift; g += hlShift; b += hlShift;
      }
      if (settings.shadows !== 0 && luma < 120) {
        const shFactor = (120 - luma) / 120;
        const shShift = settings.shadows * 0.7 * shFactor;
        r += shShift; g += shShift; b += shShift;
      }

      // Whites & Blacks
      if (settings.whites !== 0) {
        r += (r / 255) * settings.whites * 0.4;
        g += (g / 255) * settings.whites * 0.4;
        b += (b / 255) * settings.whites * 0.4;
      }
      if (settings.blacks !== 0) {
        const blkFactor = Math.max(0, 1.0 - (luma / 100));
        r += settings.blacks * 0.4 * blkFactor;
        g += settings.blacks * 0.4 * blkFactor;
        b += settings.blacks * 0.4 * blkFactor;
      }

      // 4. Contrast
      if (contrastFactor !== 1) {
        r = ((r - 128) * contrastFactor) + 128;
        g = ((g - 128) * contrastFactor) + 128;
        b = ((b - 128) * contrastFactor) + 128;
      }

      // 5. Dehaze & Clarity
      if (dehazeFactor !== 0) {
        // Dehaze deepens midtones and cleans atmospheric haze
        const darkChan = Math.min(r, g, b);
        r = r + (r - darkChan) * dehazeFactor;
        g = g + (g - darkChan) * dehazeFactor;
        b = b + (b - darkChan) * dehazeFactor;
      }
      if (clarityFactor !== 0) {
        const midDist = 1.0 - Math.abs(luma - 128) / 128;
        const clar = (luma - 128) * clarityFactor * midDist;
        r += clar; g += clar; b += clar;
      }

      // Clamp 0-255 before Curve & HSL
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      // 6. Tone Curves (RGB + Individual R, G, B channels)
      r = rCurveLut[rgbCurveLut[Math.round(r)]];
      g = gCurveLut[rgbCurveLut[Math.round(g)]];
      b = bCurveLut[rgbCurveLut[Math.round(b)]];

      // 7. HSL Color Mixer & Global Vibrance / Saturation
      const [hue, sat, lum] = rgbToHsl(r, g, b);
      const chKey = getHSLChannelKey(hue);
      const chHsl = settings.hsl[chKey];

      let newHue = hue + chHsl.hue * 0.35;
      let newSat = sat * (1 + chHsl.saturation * 0.01);
      let newLum = lum + chHsl.luminance * 0.005;

      // Global Saturation & Vibrance (vibrance preserves skin orange tones)
      if (settings.saturation !== 0) {
        newSat *= (1 + settings.saturation * 0.01);
      }
      if (settings.vibrance !== 0) {
        const vibFactor = 1.0 - sat; // Boost unsaturated colors more
        newSat += (settings.vibrance * 0.01) * vibFactor;
      }

      newSat = Math.max(0, Math.min(1, newSat));
      newLum = Math.max(0, Math.min(1, newLum));
      let [nr, ng, nb] = hslToRgb(newHue, newSat, newLum);

      // 8. 3-Way Color Grading (Shadows, Midtones, Highlights)
      const curLuma = (nr * 0.299 + ng * 0.587 + nb * 0.114) / 255;
      const cg = settings.colorGrading;
      if (cg.shadows.saturation > 0 && curLuma < 0.45) {
        const weight = (0.45 - curLuma) / 0.45 * (cg.shadows.saturation / 100);
        const [sr, sg, sb] = hslToRgb(cg.shadows.hue, 1, 0.5);
        nr = nr * (1 - weight) + sr * weight;
        ng = ng * (1 - weight) + sg * weight;
        nb = nb * (1 - weight) + sb * weight;
      }
      if (cg.highlights.saturation > 0 && curLuma > 0.55) {
        const weight = (curLuma - 0.55) / 0.45 * (cg.highlights.saturation / 100);
        const [hr, hg, hb] = hslToRgb(cg.highlights.hue, 1, 0.5);
        nr = nr * (1 - weight) + hr * weight;
        ng = ng * (1 - weight) + hg * weight;
        nb = nb * (1 - weight) + hb * weight;
      }

      // 9. Mask Adjustments (Subject vs Background vs Sky vs Gradient)
      const pixelIndex = y * width + x;
      for (const cm of computedMasks) {
        const maskDensity = cm.mask.data[pixelIndex];
        if (maskDensity > 0) {
          const maskWeight = (maskDensity / 255) * (cm.layer.opacity / 100);
          const adj = cm.layer.adjustments;

          let mr = nr;
          let mg = ng;
          let mb = nb;

          if (adj.exposure !== 0) {
            const mExp = Math.pow(2, adj.exposure);
            mr *= mExp; mg *= mExp; mb *= mExp;
          }
          if (adj.temperature !== 0) {
            mr += adj.temperature * 0.6;
            mb -= adj.temperature * 0.5;
          }
          if (adj.contrast !== 0) {
            const mCont = (adj.contrast + 100) / 100;
            mr = (mr - 128) * mCont + 128;
            mg = (mg - 128) * mCont + 128;
            mb = (mb - 128) * mCont + 128;
          }
          if (adj.saturation !== 0) {
            const [mh, ms, ml] = rgbToHsl(mr, mg, mb);
            const nms = Math.max(0, Math.min(1, ms * (1 + adj.saturation * 0.01)));
            const [smr, smg, smb] = hslToRgb(mh, nms, ml);
            mr = smr; mg = smg; mb = smb;
          }

          // Blend mask adjusted color with base color
          nr = nr * (1 - maskWeight) + mr * maskWeight;
          ng = ng * (1 - maskWeight) + mg * maskWeight;
          nb = nb * (1 - maskWeight) + mb * maskWeight;
        }
      }

      // 10. Film Grain & Sensor Texture
      if (settings.grainAmount > 0) {
        const grainNoise = (Math.random() - 0.5) * settings.grainAmount * 0.8;
        nr += grainNoise;
        ng += grainNoise;
        nb += grainNoise;
      }

      // 11. Post-Crop Vignette
      if (settings.vignetteAmount !== 0) {
        const normDist = Math.hypot(x - cx, y - cy) / maxRadius;
        const vigEdge = (settings.vignetteFeather / 100) * 0.5 + 0.3;
        if (normDist > vigEdge) {
          const vigScale = (normDist - vigEdge) / (1.0 - vigEdge);
          const factor = 1.0 + (settings.vignetteAmount * 0.008) * vigScale;
          nr *= factor;
          ng *= factor;
          nb *= factor;
        }
      }

      data[idx] = Math.max(0, Math.min(255, Math.round(nr)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(ng)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(nb)));
    }
  }

  tCtx.putImageData(imgData, 0, 0);
}

// Compute live RGBL Histogram
export function computeHistogram(canvas: HTMLCanvasElement): {
  r: number[];
  g: number[];
  b: number[];
  l: number[];
  maxVal: number;
  shadowClipping: boolean;
  highlightClipping: boolean;
} {
  const ctx = canvas.getContext('2d');
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const l = new Array(256).fill(0);

  if (!ctx) return { r, g, b, l, maxVal: 1, shadowClipping: false, highlightClipping: false };

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample step for performance
  const step = Math.max(1, Math.floor((width * height) / 100000));
  let shadowCount = 0;
  let highlightCount = 0;
  let totalSamples = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    const pl = Math.round(0.299 * pr + 0.587 * pg + 0.114 * pb);

    r[pr]++;
    g[pg]++;
    b[pb]++;
    l[pl]++;

    if (pl <= 2) shadowCount++;
    if (pl >= 253) highlightCount++;
    totalSamples++;
  }

  let maxVal = 1;
  for (let i = 0; i < 256; i++) {
    maxVal = Math.max(maxVal, r[i], g[i], b[i], l[i]);
  }

  return {
    r,
    g,
    b,
    l,
    maxVal,
    shadowClipping: shadowCount > totalSamples * 0.015,
    highlightClipping: highlightCount > totalSamples * 0.015,
  };
}
