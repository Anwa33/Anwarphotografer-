import { AdjustmentSettings, HSLSettings, Preset, ToneCurveSettings, TokinaLensProfile, ColorGradingSettings, MaskAdjustments, MaskLayer } from '../types/preset';

export const DEFAULT_HSL: HSLSettings = {
  red: { hue: 0, saturation: 0, luminance: 0 },
  orange: { hue: 0, saturation: 0, luminance: 0 },
  yellow: { hue: 0, saturation: 0, luminance: 0 },
  green: { hue: 0, saturation: 0, luminance: 0 },
  aqua: { hue: 0, saturation: 0, luminance: 0 },
  blue: { hue: 0, saturation: 0, luminance: 0 },
  purple: { hue: 0, saturation: 0, luminance: 0 },
  magenta: { hue: 0, saturation: 0, luminance: 0 },
};

export const DEFAULT_CURVE: ToneCurveSettings = {
  rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

export const DEFAULT_COLOR_GRADING: ColorGradingSettings = {
  shadows: { hue: 0, saturation: 0, luminance: 0 },
  midtones: { hue: 0, saturation: 0, luminance: 0 },
  highlights: { hue: 0, saturation: 0, luminance: 0 },
  balance: 0,
  blending: 50,
};

export const DEFAULT_TOKINA_LENS: TokinaLensProfile = {
  enabled: true,
  focalLength: 11,
  distortionCorrection: 45, // Tokina 11mm barrel distortion compensation
  vignetteRemoval: 55,       // Edge light falloff recovery at f/2.8
  chromaticAberrationFix: 60,// Lateral CA fix for ultra-wide angles
  defringePurple: 40,
  antiAliasingSharpness: 35, // D3400 OLPF-less microcontrast enhancement
};

export const DEFAULT_ADJUSTMENTS: AdjustmentSettings = {
  temperature: 0,     // 0 = 5500K daylight base
  tint: 0,
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  texture: 0,
  clarity: 0,
  dehaze: 0,
  vibrance: 0,
  saturation: 0,
  lens: { ...DEFAULT_TOKINA_LENS },
  curve: { ...DEFAULT_CURVE },
  hsl: JSON.parse(JSON.stringify(DEFAULT_HSL)),
  colorGrading: JSON.parse(JSON.stringify(DEFAULT_COLOR_GRADING)),
  sharpening: 40,
  noiseReduction: 15,
  grainAmount: 0,
  grainSize: 25,
  vignetteAmount: 0,
  vignetteFeather: 50,
};

export const DEFAULT_MASK_ADJUSTMENTS: MaskAdjustments = {
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
};

export const INITIAL_MASKS: MaskLayer[] = [
  {
    id: 'mask-subject',
    type: 'subject',
    name: 'Subjek Utama (AI Smart Mask)',
    enabled: false,
    opacity: 100,
    feather: 35,
    invert: false,
    confidence: 65,
    adjustments: {
      ...DEFAULT_MASK_ADJUSTMENTS,
      exposure: 0.35,
      clarity: 20,
      shadows: 15,
      sharpness: 25,
    },
  },
  {
    id: 'mask-background',
    type: 'background',
    name: 'Latar Belakang (Background Mask)',
    enabled: false,
    opacity: 100,
    feather: 40,
    invert: true,
    confidence: 65,
    adjustments: {
      ...DEFAULT_MASK_ADJUSTMENTS,
      exposure: -0.3,
      dehaze: 10,
      saturation: -10,
      blur: 8,
    },
  },
  {
    id: 'mask-sky',
    type: 'sky',
    name: 'Langit & Cakrawala (Sky / Horizon Mask)',
    enabled: false,
    opacity: 100,
    feather: 50,
    invert: false,
    confidence: 70,
    adjustments: {
      ...DEFAULT_MASK_ADJUSTMENTS,
      exposure: -0.45,
      highlights: -40,
      dehaze: 25,
      saturation: 20,
      temperature: -10,
    },
  },
];

export interface CategorySpec {
  id: string;
  name: string;
  subNames: string[];
  nikonProfile: 'Standard' | 'Neutral' | 'Vivid' | 'Monochrome' | 'Portrait' | 'Landscape' | 'Flat';
  focal: 11 | 14 | 16;
  baseTemp: number;
  baseTint: number;
  baseExp: number;
  baseContrast: number;
  baseHighlights: number;
  baseShadows: number;
  baseWhites: number;
  baseBlacks: number;
  baseClarity: number;
  baseDehaze: number;
  baseVibrance: number;
  baseSat: number;
  baseDistortion: number;
  baseVignette: number;
  baseSharpness: number;
  baseGrain: number;
  shadowGrade: { hue: number; sat: number };
  highlightGrade: { hue: number; sat: number };
  tags: string[];
  description: string;
}

export const PRESET_CATEGORIES: CategorySpec[] = [
  {
    id: 'astro',
    name: 'Astrophotography & Bintang Milky Way',
    subNames: ['Atacama Night', 'Tokina f2.8 Star Pop', 'Milky Way Core', 'Cosmic Dust Deep Blue', 'Northern Aurora Borealis', 'Zenith Starlight', 'Galaxy Arm Contrast', 'Perseid Meteor Glow', 'Sub-Zero Summit Astro', 'Andromeda Deep Void'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: -18,
    baseTint: 14,
    baseExp: 0.45,
    baseContrast: 28,
    baseHighlights: -25,
    baseShadows: 35,
    baseWhites: 42,
    baseBlacks: -38,
    baseClarity: 38,
    baseDehaze: 45,
    baseVibrance: 25,
    baseSat: 10,
    baseDistortion: 55,
    baseVignette: 75,
    baseSharpness: 65,
    baseGrain: 12,
    shadowGrade: { hue: 235, sat: 28 },
    highlightGrade: { hue: 50, sat: 15 },
    tags: ['Astro', 'Milky Way', '11mm', 'Night', 'f2.8', 'Stars'],
    description: 'Dikalibrasi khusus untuk sensor D3400 pada ISO tinggi dan bukaan Tokina 11mm f/2.8 dengan penarikan nebula dan bintang tajam.',
  },
  {
    id: 'landscape',
    name: 'Lanskap Gunung & Ultra-Wide Alam',
    subNames: ['Dolomites Ridge 11mm', 'Bromo Sunrise Mist', 'Fjord Reflection', 'Alpine Glacier Blue', 'Patagonia Wind Peaks', 'Emerald Cascade Valley', 'High Sierra Horizon', 'Icelandic Basalt Field', 'Rinjani Crater Rim', 'Grand Canyon Vastness'],
    nikonProfile: 'Landscape',
    focal: 11,
    baseTemp: 4,
    baseTint: -2,
    baseExp: 0.1,
    baseContrast: 18,
    baseHighlights: -35,
    baseShadows: 28,
    baseWhites: 15,
    baseBlacks: -15,
    baseClarity: 28,
    baseDehaze: 22,
    baseVibrance: 32,
    baseSat: 8,
    baseDistortion: 60,
    baseVignette: 50,
    baseSharpness: 55,
    baseGrain: 0,
    shadowGrade: { hue: 205, sat: 18 },
    highlightGrade: { hue: 42, sat: 14 },
    tags: ['Landscape', 'Mountain', '11mm', 'Nature', 'Wide', 'Sky'],
    description: 'Memaksimalkan resolusi 24.2 MP Nikon D3400 tanpa OLPF dengan detail tebing, daun, dan langit ultra-wide Tokina yang jernih.',
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour Sunset & Sunstar Tokina',
    subNames: ['Tokina 9-Blade Sunstar', 'Savannah Sunset Rim', 'Cliffside Amber Glow', 'Golden Beach Flare', 'Tuscan Hill Magic', 'Horizon Ray Flare 11mm', 'Crimson Dusk Solstice', 'Bali Coast Sunset', 'Warm Meadow Backlight', 'Sahara Dune Radiance'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: 32,
    baseTint: 8,
    baseExp: 0.15,
    baseContrast: 15,
    baseHighlights: -20,
    baseShadows: 20,
    baseWhites: 22,
    baseBlacks: -12,
    baseClarity: 16,
    baseDehaze: 10,
    baseVibrance: 35,
    baseSat: 18,
    baseDistortion: 50,
    baseVignette: 45,
    baseSharpness: 48,
    baseGrain: 5,
    shadowGrade: { hue: 32, sat: 28 },
    highlightGrade: { hue: 45, sat: 35 },
    tags: ['Golden Hour', 'Sunstar', 'Sunset', 'Warm', 'Tokina Flare'],
    description: 'Menonjolkan karakter 9 bilah diafragma Tokina 11-16mm yang menghasilkan 18-point sunstar dengan rona emas kehangatan sensor Nikon.',
  },
  {
    id: 'blue_hour',
    name: 'Blue Hour & Kota Malam Twilight',
    subNames: ['Metropolis Cobalt 11mm', 'Harbor Dusk Reflection', 'Tokyo Sky Blue Hour', 'Bridge Suspension Twilight', 'Neon Rain Puddle 14mm', 'Marina Bay Lights', 'Cold Dusk Architecture', 'European Plaza Midnight', 'Skyscraper Zenith Wide', 'Urban Horizon Indigo'],
    nikonProfile: 'Neutral',
    focal: 11,
    baseTemp: -26,
    baseTint: 12,
    baseExp: 0.2,
    baseContrast: 22,
    baseHighlights: -30,
    baseShadows: 24,
    baseWhites: 18,
    baseBlacks: -22,
    baseClarity: 24,
    baseDehaze: 18,
    baseVibrance: 20,
    baseSat: 5,
    baseDistortion: 52,
    baseVignette: 55,
    baseSharpness: 52,
    baseGrain: 4,
    shadowGrade: { hue: 228, sat: 32 },
    highlightGrade: { hue: 48, sat: 22 },
    tags: ['Blue Hour', 'Twilight', 'Cityscape', 'Night', 'Long Exposure'],
    description: 'Pencampuran kontras lampu kota halogen/LED dengan langit biru pekat senja untuk bidikan malam ultra-lebar.',
  },
  {
    id: 'architecture',
    name: 'Arsitektur & Interior Pro 11mm',
    subNames: ['Cathedral Symmetrical 11mm', 'Modern Museum Minimal', 'Glass Atrium Geometry', 'Luxury Villa Real Estate', 'Spiral Staircase Perspective', 'Concrete Brutalism Wide', 'Hotel Lobby Ambient', 'Skyscraper Low-Angle Grid', 'Gothic Vault Lines', 'Airport Terminal Horizon'],
    nikonProfile: 'Standard',
    focal: 11,
    baseTemp: 2,
    baseTint: -1,
    baseExp: 0.25,
    baseContrast: 12,
    baseHighlights: -45,
    baseShadows: 38,
    baseWhites: 10,
    baseBlacks: -8,
    baseClarity: 32,
    baseDehaze: 15,
    baseVibrance: 12,
    baseSat: 0,
    baseDistortion: 72, // Higher distortion correction for straight lines
    baseVignette: 85,    // Clean corners for interior walls
    baseSharpness: 60,
    baseGrain: 0,
    shadowGrade: { hue: 210, sat: 8 },
    highlightGrade: { hue: 40, sat: 6 },
    tags: ['Architecture', 'Interior', 'Real Estate', 'Lines', 'Geometry'],
    description: 'Koreksi distorsi geometris barel Tokina 11mm presisi untuk garis tegak lurus sempurna dan perataan eksposur interior.',
  },
  {
    id: 'moody_forest',
    name: 'Moody Forest & Pinus Berkabut',
    subNames: ['Black Forest Mist 11mm', 'Pine Canopy Canopy', 'Rainforest Dark Fern', 'Pacific Northwest Fog', 'Mossy Waterfall Cavern', 'Bamboo Grove Vertical', 'Scottish Highlands Heather', 'Damp Soil Evergreen', 'Misty Ravine Deep', 'Autumn Pine Silence'],
    nikonProfile: 'Flat',
    focal: 14,
    baseTemp: -8,
    baseTint: -6,
    baseExp: -0.15,
    baseContrast: 16,
    baseHighlights: -28,
    baseShadows: 14,
    baseWhites: -10,
    baseBlacks: 12,
    baseClarity: 22,
    baseDehaze: -8,
    baseVibrance: -5,
    baseSat: -15,
    baseDistortion: 45,
    baseVignette: 40,
    baseSharpness: 45,
    baseGrain: 8,
    shadowGrade: { hue: 165, sat: 22 },
    highlightGrade: { hue: 95, sat: 12 },
    tags: ['Moody', 'Forest', 'Mist', 'Fog', 'Green', 'Atmosphere'],
    description: 'Nuansa hijau zaitun desaturasi dengan highlight lembut dan kabut atmosferik yang dalam.',
  },
  {
    id: 'cinematic_teal_orange',
    name: 'Sinematik Teal & Orange Blockbuster',
    subNames: ['Hollywood Action 11mm', 'Sci-Fi Neon Horizon', 'Blade Runner Gritty', 'Dune Warm Sands Teal Sky', 'Cyber District Cinema', 'Retro Driveway 35mm', 'Neon Alley Punch', 'Sunset Highway Teal Mids', 'Gotham Dark Hero', 'Interstellar Void'],
    nikonProfile: 'Neutral',
    focal: 11,
    baseTemp: 10,
    baseTint: 4,
    baseExp: 0.1,
    baseContrast: 30,
    baseHighlights: -22,
    baseShadows: 16,
    baseWhites: 18,
    baseBlacks: -26,
    baseClarity: 26,
    baseDehaze: 18,
    baseVibrance: 28,
    baseSat: 12,
    baseDistortion: 50,
    baseVignette: 60,
    baseSharpness: 50,
    baseGrain: 14,
    shadowGrade: { hue: 195, sat: 42 },   // Deep Teal
    highlightGrade: { hue: 35, sat: 38 }, // Rich Orange
    tags: ['Cinematic', 'Teal Orange', 'Movie', 'Color Grade', 'Blockbuster'],
    description: 'Grading warna komplementer bioskop legendaris teal di area bayangan dan orange hangat di area terang.',
  },
  {
    id: 'street_urban',
    name: 'Street Photography & Urban Perspective',
    subNames: ['Crosswalk 11mm Low-Angle', 'Subway Neon Rush', 'Skateboarder Concrete Fisheye', 'Alleyway Shadow Play', 'New York Highline Wide', 'Pedestrian Blur 14mm', 'Asphalt Grain Grit', 'Urban Monolith Wall', 'Night Cab Streaks', 'Rooftop Horizon Vantage'],
    nikonProfile: 'Standard',
    focal: 11,
    baseTemp: -4,
    baseTint: 2,
    baseExp: 0.05,
    baseContrast: 26,
    baseHighlights: -15,
    baseShadows: -12,
    baseWhites: 24,
    baseBlacks: -32,
    baseClarity: 35,
    baseDehaze: 20,
    baseVibrance: 14,
    baseSat: -6,
    baseDistortion: 40,
    baseVignette: 50,
    baseSharpness: 62,
    baseGrain: 18,
    shadowGrade: { hue: 220, sat: 15 },
    highlightGrade: { hue: 55, sat: 18 },
    tags: ['Street', 'Urban', 'Documentary', 'Clarity', 'Wide Angle'],
    description: 'Kontras tekstur aspal, bayangan dramatis, dan sudut rendah agresif khas lensa ultra-lebar Tokina 11mm.',
  },
  {
    id: 'film_emulation',
    name: 'Analog 35mm Vintage Film Emulation',
    subNames: ['Kodak Portra 400 Warmth', 'Fujifilm Velvia 50 Pop', 'Kodak Tri-X 400 Grain', 'CineStill 800T Halation', 'Ilford HP5 Plus Monochrome', 'Agfa Vista 200 Red Pop', 'Kodachrome 64 Nostalgia', 'Fuji Pro 400H Soft Green', 'Polaroid 600 Faded Matte', 'Ektachrome 100 Vivid Chrome'],
    nikonProfile: 'Neutral',
    focal: 14,
    baseTemp: 14,
    baseTint: 6,
    baseExp: 0.12,
    baseContrast: 14,
    baseHighlights: -18,
    baseShadows: 18,
    baseWhites: -8,
    baseBlacks: 16, // Matte lifted black
    baseClarity: 8,
    baseDehaze: 0,
    baseVibrance: 12,
    baseSat: 6,
    baseDistortion: 45,
    baseVignette: 35,
    baseSharpness: 35,
    baseGrain: 32, // Authentic film grain
    shadowGrade: { hue: 45, sat: 16 },
    highlightGrade: { hue: 52, sat: 20 },
    tags: ['Film', 'Analog', 'Portra', 'Vintage', 'Grain', 'Matte'],
    description: 'Emulasi rol film klasik 35mm dengan grain organik, highlight rolloff lembut, dan bayangan matte nostalgia.',
  },
  {
    id: 'black_and_white',
    name: 'Fine Art Black & White Ansel Adams',
    subNames: ['Zone System Silver 11mm', 'High Contrast Urban B&W', 'Deep Black Dramatic Cloud', 'Smooth Platinum Tonal', 'Pinhole Vintage B&W', 'Rock Texture Monochrome', 'Architectural Silhouette', 'Noir Detective Shadow', 'Milky Way Dark Silver', 'Minimalist Mist B&W'],
    nikonProfile: 'Monochrome',
    focal: 11,
    baseTemp: 0,
    baseTint: 0,
    baseExp: 0.08,
    baseContrast: 38,
    baseHighlights: -24,
    baseShadows: 12,
    baseWhites: 36,
    baseBlacks: -44,
    baseClarity: 42,
    baseDehaze: 26,
    baseVibrance: 0,
    baseSat: -100, // Complete Monochrome
    baseDistortion: 50,
    baseVignette: 65,
    baseSharpness: 68,
    baseGrain: 20,
    shadowGrade: { hue: 0, sat: 0 },
    highlightGrade: { hue: 0, sat: 0 },
    tags: ['B&W', 'Monochrome', 'Hitam Putih', 'High Contrast', 'Fine Art'],
    description: 'Gradasi 10 zona eksposur perak kaya detail dari hitam pekat hingga putih murni untuk seni rupa monokrom.',
  },
  {
    id: 'tropical_beach',
    name: 'Pantai Tropis & Air Turquoise',
    subNames: ['Raja Ampat Cyan Water 11mm', 'Coral Reef Overhead', 'Golden Sand Tropical Palm', 'Maldives Azure Lagoon', 'Gili Trawangan Horizon', 'White Surf Spray Wide', 'Seychelles Granite Rock', 'Turks & Caicos Sun', 'Emerald Bay Drone View', 'Pacific Wave Barrel Wide'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: 8,
    baseTint: -8,
    baseExp: 0.22,
    baseContrast: 18,
    baseHighlights: -32,
    baseShadows: 22,
    baseWhites: 20,
    baseBlacks: -14,
    baseClarity: 24,
    baseDehaze: 22,
    baseVibrance: 40,
    baseSat: 16,
    baseDistortion: 50,
    baseVignette: 45,
    baseSharpness: 54,
    baseGrain: 0,
    shadowGrade: { hue: 188, sat: 28 }, // Turquoise shadow
    highlightGrade: { hue: 48, sat: 24 }, // Golden sand highlight
    tags: ['Beach', 'Tropical', 'Ocean', 'Cyan', 'Summer', 'Turquoise'],
    description: 'Menonjolkan warna air laut toska/cyan murni, pasir pantai keemasan, dan birunya langit khatulistiwa.',
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk 2077 & Neon Malam',
    subNames: ['Akihabara Neon Rain 11mm', 'Synthwave Purple Glow', 'Shinjuku Cyber Grid', 'Electric Cyan Puddle', 'Laser Magenta Horizon', 'Hologram Blade Alley', 'Midnight Macau Casino', 'Seoul Cyber Highway', 'Hong Kong High-Rise Neon', 'Chongqing 3D Cityscape'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: -14,
    baseTint: 28,
    baseExp: 0.15,
    baseContrast: 34,
    baseHighlights: 12,
    baseShadows: -18,
    baseWhites: 30,
    baseBlacks: -36,
    baseClarity: 38,
    baseDehaze: 24,
    baseVibrance: 45,
    baseSat: 25,
    baseDistortion: 45,
    baseVignette: 70,
    baseSharpness: 58,
    baseGrain: 15,
    shadowGrade: { hue: 285, sat: 48 }, // Electric Magenta/Purple
    highlightGrade: { hue: 185, sat: 50 }, // Neon Cyan
    tags: ['Cyberpunk', 'Neon', 'Synthwave', 'Purple', 'Night Street'],
    description: 'Warna ungu neon futuristik dan cyan elektrik berenergi tinggi untuk pemandangan malam kota futuristik.',
  },
  {
    id: 'soft_pastel',
    name: 'Editorial Soft Pastel & Minimalis',
    subNames: ['Nordic Morning Milk', 'Soft Peachy Dune 16mm', 'Whispering Cloud White', 'Minimalist Shoreline Pastel', 'Japanese Clean Aesthetic', 'Muted Lavender Bloom', 'Cream Coffee Minimal', 'Frosted Glass Editorial', 'Subtle Olive Interior', 'Desert Rose Horizon'],
    nikonProfile: 'Flat',
    focal: 16,
    baseTemp: 12,
    baseTint: 6,
    baseExp: 0.35,
    baseContrast: -12,
    baseHighlights: -15,
    baseShadows: 25,
    baseWhites: -6,
    baseBlacks: 18,
    baseClarity: -10,
    baseDehaze: -5,
    baseVibrance: -8,
    baseSat: -18,
    baseDistortion: 35,
    baseVignette: 20,
    baseSharpness: 30,
    baseGrain: 6,
    shadowGrade: { hue: 35, sat: 14 },
    highlightGrade: { hue: 15, sat: 12 },
    tags: ['Pastel', 'Soft', 'Minimal', 'Editorial', 'Clean', 'Creamy'],
    description: 'Estetika majalah editorial bersih, warna pastel lembut, saturasi tenang, dan kontras halus.',
  },
  {
    id: 'storm_skies',
    name: 'Storm Chaser & Awan Dramatis',
    subNames: ['Supercell Tornado Core 11mm', 'Thunderhead Cumulus Dark', 'Lightning Strike Horizon', 'Monsoon Downpour Wide', 'Ominous Shelf Cloud', 'Dark Tempest Gale', 'Atlantic Squall Line', 'Hailstorm Indigo Sky', 'Desert Flash Storm', 'High Plateau Vortex'],
    nikonProfile: 'Landscape',
    focal: 11,
    baseTemp: -12,
    baseTint: 4,
    baseExp: -0.1,
    baseContrast: 32,
    baseHighlights: -42,
    baseShadows: 18,
    baseWhites: 28,
    baseBlacks: -34,
    baseClarity: 48, // Microcontrast cloud detail
    baseDehaze: 42,
    baseVibrance: 22,
    baseSat: 8,
    baseDistortion: 50,
    baseVignette: 55,
    baseSharpness: 64,
    baseGrain: 10,
    shadowGrade: { hue: 215, sat: 26 },
    highlightGrade: { hue: 42, sat: 16 },
    tags: ['Storm', 'Sky', 'Clouds', 'Dramatic', 'Dehaze', 'Tempest'],
    description: 'Dehaze dan clarity tingkat tinggi untuk membongkar detail gumpalan awan badai dan kilat di langit ultra-lebar.',
  },
  {
    id: 'autumn_foliage',
    name: 'Musim Gugur & Daun Keemasan',
    subNames: ['Kyoto Maple Scarlet 11mm', 'New England Crimson Forest', 'Aspen Gold Mountain Path', 'Bavarian Autumn Mist', 'Golden Birch Creek', 'Amber Canopy Tunnel', 'Harvest Pumpkin Warmth', 'Rusty Oak Ridgeline', 'Misty Lake Autumn Mirror', 'Fallen Leaf Carpet Wide'],
    nikonProfile: 'Landscape',
    focal: 14,
    baseTemp: 22,
    baseTint: 10,
    baseExp: 0.1,
    baseContrast: 20,
    baseHighlights: -24,
    baseShadows: 22,
    baseWhites: 16,
    baseBlacks: -14,
    baseClarity: 22,
    baseDehaze: 14,
    baseVibrance: 38,
    baseSat: 20,
    baseDistortion: 45,
    baseVignette: 40,
    baseSharpness: 52,
    baseGrain: 4,
    shadowGrade: { hue: 25, sat: 25 },
    highlightGrade: { hue: 45, sat: 35 },
    tags: ['Autumn', 'Fall', 'Red', 'Gold', 'Amber', 'Foliage'],
    description: 'Menggeser kanal kuning dan hijau ke rona oranye keemasan dan merah kirmizi yang hangat dan memukau.',
  },
  {
    id: 'wide_portrait',
    name: 'Potret Lingkungan & Subjek Ultra-Wide',
    subNames: ['Environmental Traveler 16mm', 'Cliff Edge Explorer Silhouette', 'Fashion Editorial Wide Angle', 'Skater Action Portrait', 'Architectural Model Stance', 'Wedding Couple Epic Landscape', 'Music Festival Crowd Energy', 'Adventure Trekker Portrait', 'Urban Rooftop Stance', 'Golden Hour Model Backlight'],
    nikonProfile: 'Portrait',
    focal: 16,
    baseTemp: 14,
    baseTint: 4,
    baseExp: 0.28,
    baseContrast: 10,
    baseHighlights: -22,
    baseShadows: 26,
    baseWhites: 12,
    baseBlacks: -8,
    baseClarity: 12,
    baseDehaze: 6,
    baseVibrance: 18,
    baseSat: 4,
    baseDistortion: 30, // Optimized for 16mm minimal facial distortion
    baseVignette: 35,
    baseSharpness: 42,
    baseGrain: 8,
    shadowGrade: { hue: 25, sat: 14 },
    highlightGrade: { hue: 38, sat: 18 },
    tags: ['Portrait', 'Subject', '16mm', 'Environmental', 'Skin Tone'],
    description: 'Disesuaikan pada panjang fokus 16mm untuk proporsi subjek alami, warna kulit bersinar, dan latar megah.',
  },
  {
    id: 'automotive_rig',
    name: 'Otomotif & Mobil Sport Low-Angle',
    subNames: ['Supercar Front Grille 11mm', 'Asphalt Panning Track Wide', 'Matte Black Carbon Fiber', 'Rim & Brake Caliper Detail', 'Drift Smoke Backlit', 'Highway Tunnel Reflection', 'Classic Muscle Car Stance', 'Rally Mud Splatter Action', 'Night Garage Neon Rig', 'Exotic Roadster Sunset Flare'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: -6,
    baseTint: 2,
    baseExp: 0.12,
    baseContrast: 32,
    baseHighlights: -18,
    baseShadows: 18,
    baseWhites: 32,
    baseBlacks: -35,
    baseClarity: 45,
    baseDehaze: 26,
    baseVibrance: 25,
    baseSat: 10,
    baseDistortion: 48,
    baseVignette: 60,
    baseSharpness: 66,
    baseGrain: 12,
    shadowGrade: { hue: 215, sat: 22 },
    highlightGrade: { hue: 45, sat: 20 },
    tags: ['Automotive', 'Car', 'Metallic', 'Low Angle', 'Clarity', 'Speed'],
    description: 'Menonjolkan lekukan bodi mobil, pantulan cat metalik, dan kesan agresif roda depan berkat lensa ultra-lebar.',
  },
  {
    id: 'coffee_lifestyle',
    name: 'Coffee Shop & Earthy Bohemian',
    subNames: ['Espresso Crema Wood 16mm', 'Artisan Pottery Studio', 'Botanical Greenhouse Coffee', 'Rustic Brick Cafe Corner', 'Warm Linen Lifestyle', 'Morning Pour-Over Glow', 'Vintage Bookshop Shelf', 'Cinnamon Spice Latte', 'Acoustic Guitar Bohemian', 'Cozy Fireside Blanket'],
    nikonProfile: 'Neutral',
    focal: 16,
    baseTemp: 24,
    baseTint: 8,
    baseExp: 0.18,
    baseContrast: 12,
    baseHighlights: -16,
    baseShadows: 24,
    baseWhites: -4,
    baseBlacks: 14,
    baseClarity: 14,
    baseDehaze: 4,
    baseVibrance: 16,
    baseSat: 2,
    baseDistortion: 32,
    baseVignette: 40,
    baseSharpness: 40,
    baseGrain: 16,
    shadowGrade: { hue: 32, sat: 24 },
    highlightGrade: { hue: 48, sat: 22 },
    tags: ['Coffee', 'Lifestyle', 'Earthy', 'Boho', 'Warm', 'Wood'],
    description: 'Nuansa cokelat kayu cedar hangat, rona kopi latte organik, dan bayangan matte lembut yang estetis.',
  },
  {
    id: 'real_estate_hdr',
    name: 'Real Estate & Interior Pro HDR',
    subNames: ['Living Room Window Pull 11mm', 'Marble Kitchen Island Wide', 'Master Suite Balcony View', 'Modern Bathroom Glass 11mm', 'Open Concept Dining Area', 'Hardwood Floor Reflection', 'Penthouse Skyline Terrace', 'High Ceiling Chandelier', 'Minimalist Staircase Loft', 'Exterior Twilight Pool Villa'],
    nikonProfile: 'Standard',
    focal: 11,
    baseTemp: 0,
    baseTint: -2,
    baseExp: 0.3,
    baseContrast: 8,
    baseHighlights: -65, // Strong window pull highlight recovery
    baseShadows: 48,    // High shadow lift for dark room corners
    baseWhites: 12,
    baseBlacks: -10,
    baseClarity: 28,
    baseDehaze: 14,
    baseVibrance: 16,
    baseSat: 2,
    baseDistortion: 75, // Maximum rectilinear correction for flat walls
    baseVignette: 90,   // Remove all corner shadows
    baseSharpness: 58,
    baseGrain: 0,
    shadowGrade: { hue: 200, sat: 6 },
    highlightGrade: { hue: 45, sat: 8 },
    tags: ['Real Estate', 'HDR', 'Interior', 'Window Pull', 'Clean Lines'],
    description: 'Teknik penyeimbangan jendela HDR profesional: menahan cahaya jendela luar dan mencerahkan interior ruangan.',
  },
  {
    id: 'tokina_special_fx',
    name: 'Tokina 11mm Signature Extreme FX',
    subNames: ['11mm Extreme Fish-Warp', 'Hyper-Focal Infinite Depth', 'Dynamic Cloud Radial Stretch', 'Sunburst Beam Dispersion', 'Skyscraper Vortex Zenith', 'Under-Bridge Echo Lines', 'Cave Mouth Vast Opening', 'Ultra-Macro Flower Horizon', 'High-Speed Pavement Warp', 'Zero-Gravity Architectural Orbit'],
    nikonProfile: 'Vivid',
    focal: 11,
    baseTemp: 6,
    baseTint: 2,
    baseExp: 0.2,
    baseContrast: 28,
    baseHighlights: -30,
    baseShadows: 25,
    baseWhites: 26,
    baseBlacks: -28,
    baseClarity: 50,
    baseDehaze: 30,
    baseVibrance: 32,
    baseSat: 15,
    baseDistortion: 15, // Intentional wide-angle perspective drama
    baseVignette: 65,
    baseSharpness: 70,
    baseGrain: 14,
    shadowGrade: { hue: 210, sat: 30 },
    highlightGrade: { hue: 40, sat: 30 },
    tags: ['Tokina FX', '11mm', 'Ultra-Wide', 'Extreme Perspective', 'Sunburst'],
    description: 'Preset andalan yang merayakan distorsi dinamis dan kedalaman tak terbatas lensa Tokina 11mm f/2.8.',
  },
];

// Generates exactly 1000 authentic presets (20 categories x 50 presets each)
export function generate1000Presets(): Preset[] {
  const presets: Preset[] = [];

  PRESET_CATEGORIES.forEach((cat, catIdx) => {
    // 50 variations per category
    for (let i = 1; i <= 50; i++) {
      // Pick sub-name
      const subIdx = (i - 1) % cat.subNames.length;
      const variationTier = Math.floor((i - 1) / cat.subNames.length) + 1;
      const subName = cat.subNames[subIdx];
      const presetName = `${subName} ${variationTier > 1 ? `Vol.${variationTier}` : `Pro`}`;
      const presetId = `${cat.id}-${String(i).padStart(3, '0')}`;

      // Fine-tune adjustments with deterministic variation
      const seedFactor = (i * 7) % 19 - 9; // Range -9 to +9
      const seedFactorB = (i * 13) % 17 - 8; // Range -8 to +8

      const temp = Math.max(-100, Math.min(100, cat.baseTemp + seedFactor * 1.5));
      const tint = Math.max(-100, Math.min(100, cat.baseTint + seedFactorB * 0.8));
      const exp = Math.max(-2, Math.min(2, Number((cat.baseExp + (seedFactor * 0.03)).toFixed(2))));
      const contrast = Math.max(-100, Math.min(100, cat.baseContrast + seedFactor * 1.8));
      const highlights = Math.max(-100, Math.min(100, cat.baseHighlights - seedFactorB * 1.5));
      const shadows = Math.max(-100, Math.min(100, cat.baseShadows + seedFactor * 1.4));
      const whites = Math.max(-100, Math.min(100, cat.baseWhites + seedFactorB * 1.2));
      const blacks = Math.max(-100, Math.min(100, cat.baseBlacks - seedFactor * 1.5));
      const clarity = Math.max(-100, Math.min(100, cat.baseClarity + seedFactor * 1.2));
      const dehaze = Math.max(-100, Math.min(100, cat.baseDehaze + seedFactorB * 1.4));
      const vibrance = Math.max(-100, Math.min(100, cat.baseVibrance + seedFactor * 1.1));
      const saturation = cat.baseSat === -100 ? -100 : Math.max(-100, Math.min(100, cat.baseSat + seedFactorB * 0.9));

      // Tone curve points: S-curve varying by preset mood
      const curveLift = (i % 5 === 0) ? 15 : 0; // Matte blacks on some
      const curveContrast = Math.round(contrast * 0.4);
      const rgbCurve = [
        { x: 0, y: Math.max(0, curveLift) },
        { x: 64, y: Math.max(0, 64 - curveContrast) },
        { x: 192, y: Math.min(255, 192 + curveContrast) },
        { x: 255, y: 255 },
      ];

      // HSL adjustments
      const hsl: HSLSettings = JSON.parse(JSON.stringify(DEFAULT_HSL));
      if (cat.id === 'landscape' || cat.id === 'tropical_beach') {
        hsl.blue.saturation = 25 + seedFactor;
        hsl.blue.luminance = -15;
        hsl.green.hue = 15;
        hsl.green.saturation = 20 + seedFactorB;
        hsl.aqua.saturation = 30;
      } else if (cat.id === 'cinematic_teal_orange') {
        hsl.orange.saturation = 25;
        hsl.orange.luminance = 10;
        hsl.blue.hue = -20;
        hsl.aqua.hue = -15;
        hsl.aqua.saturation = 35;
      } else if (cat.id === 'autumn_foliage') {
        hsl.green.hue = -45; // Turn greens into orange/yellow
        hsl.yellow.hue = -15;
        hsl.orange.saturation = 35;
        hsl.red.saturation = 30;
      } else if (cat.id === 'moody_forest') {
        hsl.green.saturation = -35;
        hsl.green.luminance = -20;
        hsl.yellow.saturation = -25;
      } else if (cat.id === 'wide_portrait') {
        hsl.orange.luminance = 15; // Brighten skin
        hsl.orange.saturation = -5;
        hsl.red.saturation = 10;
      }

      // Color Grading
      const colorGrading: ColorGradingSettings = {
        shadows: {
          hue: cat.shadowGrade.hue,
          saturation: Math.min(100, cat.shadowGrade.sat + Math.abs(seedFactor)),
          luminance: -5,
        },
        midtones: {
          hue: (cat.highlightGrade.hue + cat.shadowGrade.hue) / 2,
          saturation: Math.max(0, Math.round(cat.shadowGrade.sat * 0.4)),
          luminance: 0,
        },
        highlights: {
          hue: cat.highlightGrade.hue,
          saturation: Math.min(100, cat.highlightGrade.sat + Math.abs(seedFactorB)),
          luminance: 5,
        },
        balance: seedFactor * 2,
        blending: 50,
      };

      const preset: Preset = {
        id: presetId,
        name: presetName,
        category: cat.name,
        subCategory: cat.id,
        nikonProfile: cat.nikonProfile,
        tokinaOptimizedFocal: cat.focal,
        description: `${cat.name} #${i}. ${cat.description}`,
        tags: [...cat.tags, `Preset #${catIdx * 50 + i}`],
        isFavorite: (catIdx === 0 && i === 1) || (catIdx === 1 && i === 1) || (catIdx === 2 && i === 1) || (catIdx === 4 && i === 1),
        settings: {
          temperature: Math.round(temp),
          tint: Math.round(tint),
          exposure: exp,
          contrast: Math.round(contrast),
          highlights: Math.round(highlights),
          shadows: Math.round(shadows),
          whites: Math.round(whites),
          blacks: Math.round(blacks),
          texture: Math.round(clarity * 0.7),
          clarity: Math.round(clarity),
          dehaze: Math.round(dehaze),
          vibrance: Math.round(vibrance),
          saturation: Math.round(saturation),
          lens: {
            enabled: true,
            focalLength: cat.focal,
            distortionCorrection: Math.round(cat.baseDistortion + seedFactor * 0.5),
            vignetteRemoval: Math.round(cat.baseVignette + seedFactorB * 0.5),
            chromaticAberrationFix: 65,
            defringePurple: 45,
            antiAliasingSharpness: 40,
          },
          curve: {
            rgb: rgbCurve,
            red: DEFAULT_CURVE.red,
            green: DEFAULT_CURVE.green,
            blue: DEFAULT_CURVE.blue,
          },
          hsl,
          colorGrading,
          sharpening: Math.round(cat.baseSharpness),
          noiseReduction: cat.id === 'astro' ? 35 : 15,
          grainAmount: Math.round(cat.baseGrain),
          grainSize: 25,
          vignetteAmount: cat.id === 'architecture' || cat.id === 'real_estate_hdr' ? 0 : -10 + seedFactor,
          vignetteFeather: 50,
        },
      };

      presets.push(preset);
    }
  });

  return presets;
}
