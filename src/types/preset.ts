export type NikonPictureControl = 'Standard' | 'Neutral' | 'Vivid' | 'Monochrome' | 'Portrait' | 'Landscape' | 'Flat';

export interface HSLChannel {
  hue: number;        // -100 to +100
  saturation: number; // -100 to +100
  luminance: number;  // -100 to +100
}

export interface HSLSettings {
  red: HSLChannel;
  orange: HSLChannel;
  yellow: HSLChannel;
  green: HSLChannel;
  aqua: HSLChannel;
  blue: HSLChannel;
  purple: HSLChannel;
  magenta: HSLChannel;
}

export interface ColorWheelGrade {
  hue: number;        // 0 to 360
  saturation: number; // 0 to 100
  luminance: number;  // -100 to +100
}

export interface ColorGradingSettings {
  shadows: ColorWheelGrade;
  midtones: ColorWheelGrade;
  highlights: ColorWheelGrade;
  balance: number;    // -100 to +100
  blending: number;   // 0 to 100
}

export interface CurvePoint {
  x: number; // 0 to 255
  y: number; // 0 to 255
}

export interface ToneCurveSettings {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface TokinaLensProfile {
  enabled: boolean;
  focalLength: 11 | 14 | 16;
  distortionCorrection: number; // -100 to +100 (11mm typical barrel is +40 to +65)
  vignetteRemoval: number;       // 0 to 100
  chromaticAberrationFix: number; // 0 to 100
  defringePurple: number;       // 0 to 100
  antiAliasingSharpness: number;// 0 to 100 (compensates Nikon D3400 AA filter)
}

export interface AdjustmentSettings {
  // White Balance
  temperature: number; // 2000 to 10000 Kelvin (offset -100 to +100 from 5500K)
  tint: number;        // -100 to +100 (Green to Magenta)
  
  // Basic Tones
  exposure: number;    // -5.0 to +5.0 EV (slider -100 to +100 mapped)
  contrast: number;    // -100 to +100
  highlights: number;  // -100 to +100
  shadows: number;     // -100 to +100
  whites: number;      // -100 to +100
  blacks: number;      // -100 to +100
  
  // Presence
  texture: number;     // -100 to +100
  clarity: number;     // -100 to +100
  dehaze: number;      // -100 to +100
  vibrance: number;    // -100 to +100
  saturation: number;  // -100 to +100
  
  // Tokina 11-16mm Lens Profile
  lens: TokinaLensProfile;
  
  // Tone Curve
  curve: ToneCurveSettings;
  
  // HSL Mixer
  hsl: HSLSettings;
  
  // 3-Way Color Grading
  colorGrading: ColorGradingSettings;
  
  // Detail
  sharpening: number;      // 0 to 100
  noiseReduction: number;  // 0 to 100
  grainAmount: number;     // 0 to 100
  grainSize: number;       // 0 to 100
  
  // Effects Vignette
  vignetteAmount: number;  // -100 to +100
  vignetteFeather: number; // 0 to 100
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  nikonProfile: NikonPictureControl;
  tokinaOptimizedFocal: 11 | 14 | 16;
  description: string;
  tags: string[];
  isFavorite?: boolean;
  settings: AdjustmentSettings;
}

export type MaskTarget = 'global' | 'subject' | 'background' | 'sky' | 'radial' | 'linear';

export interface MaskAdjustments {
  exposure: number;
  temperature: number;
  tint: number;
  contrast: number;
  highlights: number;
  shadows: number;
  clarity: number;
  dehaze: number;
  saturation: number;
  sharpness: number;
  blur: number;
}

export interface MaskLayer {
  id: string;
  type: MaskTarget;
  name: string;
  enabled: boolean;
  opacity: number;      // 0 to 100
  feather: number;      // 0 to 100
  invert: boolean;
  confidence: number;   // 0 to 100 (for AI subject/sky threshold)
  adjustments: MaskAdjustments;
  // Geometric params for radial / linear
  radialCenterX?: number; // 0 to 1
  radialCenterY?: number; // 0 to 1
  radialRadiusX?: number; // 0 to 1
  radialRadiusY?: number; // 0 to 1
  linearAngle?: number;   // 0 to 360
  linearPosition?: number;// 0 to 1
}

export interface GeometrySettings {
  rotation: number;     // -45 to 45 deg fine
  straighten: number;
  flipH: boolean;
  flipV: boolean;
  aspectRatio: 'original' | '1:1' | '4:5' | '16:9' | '3:2';
}

export interface PresetCategoryInfo {
  id: string;
  name: string;
  count: number;
  iconName: string;
  description: string;
}
