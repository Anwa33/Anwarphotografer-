export interface SamplePhoto {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  specs: string;
  dataUrl: string;
}

// Generates high quality photographic canvases representing Nikon D3400 + Tokina 11-16mm shots
export function createSamplePhoto(type: 'landscape' | 'astro' | 'architecture' | 'golden_hour'): string {
  const width = 1600;
  const height = 1067; // 3:2 Nikon D3400 aspect ratio
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'landscape') {
    // 11mm Ultra-Wide Mountain Lake Landscape with Foreground Rock & Figure
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
    skyGrad.addColorStop(0, '#1c3d5a');
    skyGrad.addColorStop(0.35, '#3b82f6');
    skyGrad.addColorStop(0.7, '#93c5fd');
    skyGrad.addColorStop(1, '#fed7aa');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Clouds (Wide angle sweep)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const cx = (i * 120 + 40);
      const cy = 90 + Math.sin(i * 0.8) * 35;
      ctx.ellipse(cx, cy, 140, 22, -0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant jagged mountains (Dolomites / Alps)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.48);
    const mtnPoints = [
      [150, 260], [280, 340], [420, 220], [560, 310], [700, 180],
      [840, 290], [980, 210], [1120, 320], [1280, 230], [1450, 330], [1600, 290]
    ];
    for (const pt of mtnPoints) {
      ctx.lineTo(pt[0], pt[1]);
    }
    ctx.lineTo(width, height * 0.6);
    ctx.lineTo(0, height * 0.6);
    ctx.closePath();
    ctx.fill();

    // Snow caps on peaks
    ctx.fillStyle = '#f8fafc';
    for (const pt of [[420, 220], [700, 180], [980, 210], [1280, 230]]) {
      ctx.beginPath();
      ctx.moveTo(pt[0], pt[1]);
      ctx.lineTo(pt[0] - 40, pt[1] + 60);
      ctx.lineTo(pt[0] + 45, pt[1] + 65);
      ctx.closePath();
      ctx.fill();
    }

    // Midground pine tree slopes
    const slopeGrad = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.65);
    slopeGrad.addColorStop(0, '#1e293b');
    slopeGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = slopeGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.42);
    ctx.bezierCurveTo(400, height * 0.52, 900, height * 0.40, width, height * 0.50);
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(0, height * 0.65);
    ctx.closePath();
    ctx.fill();

    // Alpine Lake Reflection
    const waterGrad = ctx.createLinearGradient(0, height * 0.52, 0, height * 0.85);
    waterGrad.addColorStop(0, '#0f766e');
    waterGrad.addColorStop(0.5, '#115e59');
    waterGrad.addColorStop(1, '#134e4a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, height * 0.52, width, height * 0.35);

    // Water ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let y = height * 0.54; y < height * 0.82; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.25, y + 2, width * 0.75, y - 2, width, y);
      ctx.stroke();
    }

    // Foreground Rock & Landscape Shoreline (11mm wide perspective)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.8);
    ctx.bezierCurveTo(300, height * 0.72, 700, height * 0.84, width, height * 0.75);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Foreground Boulder
    const rockGrad = ctx.createRadialGradient(400, height * 0.85, 20, 420, height * 0.86, 260);
    rockGrad.addColorStop(0, '#57534e');
    rockGrad.addColorStop(0.7, '#292524');
    rockGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.ellipse(420, height * 0.88, 280, 110, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Subject (Traveler standing on foreground rock admiring mountain - perfect for Subject Masking!)
    const personX = 850;
    const personY = height * 0.68;
    // Body / Red Jacket
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(personX, personY + 50, 24, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head / Beanie
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(personX, personY, 14, 0, Math.PI * 2);
    ctx.fill();
    // Legs / Dark Pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(personX - 16, personY + 85, 12, 55);
    ctx.fillRect(personX + 4, personY + 85, 12, 55);
    // Camera strap / backpack
    ctx.fillStyle = '#475569';
    ctx.fillRect(personX - 22, personY + 28, 14, 38);

  } else if (type === 'astro') {
    // 11mm f/2.8 Astrophotography & Milky Way Core
    // Deep Cosmic Gradient
    const spaceGrad = ctx.createLinearGradient(0, 0, width, height);
    spaceGrad.addColorStop(0, '#030712');
    spaceGrad.addColorStop(0.4, '#090d16');
    spaceGrad.addColorStop(0.75, '#0d1322');
    spaceGrad.addColorStop(1, '#111827');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Milky Way Galactic Dust Arm (Diagonal Band across Tokina 11mm ultra-wide field)
    const mwGrad = ctx.createRadialGradient(width * 0.55, height * 0.42, 50, width * 0.55, height * 0.42, 550);
    mwGrad.addColorStop(0, 'rgba(238, 210, 255, 0.45)');
    mwGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.25)');
    mwGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
    mwGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.translate(width * 0.5, height * 0.45);
    ctx.rotate(-0.55);
    ctx.fillStyle = mwGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 700, 160, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Thousands of pin-point sharp stars
    for (let i = 0; i < 900; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * (height * 0.82);
      const rad = Math.random() < 0.04 ? 2.5 : Math.random() < 0.15 ? 1.5 : 0.8;
      const alpha = Math.random() * 0.85 + 0.15;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();

      // Colored stars (blue/yellow giants)
      if (i % 25 === 0) {
        ctx.fillStyle = 'rgba(147, 197, 253, 0.9)'; // Blue
        ctx.arc(sx, sy, rad * 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 33 === 0) {
        ctx.fillStyle = 'rgba(253, 186, 116, 0.9)'; // Orange
        ctx.arc(sx, sy, rad * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Horizon Airglow (Green/Orange atmospheric emission line)
    const airglowGrad = ctx.createLinearGradient(0, height * 0.65, 0, height * 0.85);
    airglowGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
    airglowGrad.addColorStop(0.6, 'rgba(74, 222, 128, 0.18)');
    airglowGrad.addColorStop(1, 'rgba(249, 115, 22, 0.15)');
    ctx.fillStyle = airglowGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.2);

    // Foreground Silhouette (Pine trees & rocky ridge)
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.78);
    for (let x = 0; x <= width; x += 15) {
      const treeHeight = (x % 30 === 0) ? 65 : (x % 45 === 0) ? 90 : 25;
      const y = height * 0.82 - Math.sin(x * 0.005) * 40 - treeHeight;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Subject: Tent / Astrophotographer with Headlamp Beam (Perfect Subject Masking target!)
    const tentX = 420;
    const tentY = height * 0.85;
    // Glowing warm tent
    const tentLight = ctx.createRadialGradient(tentX, tentY + 20, 5, tentX, tentY + 20, 80);
    tentLight.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
    tentLight.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
    tentLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tentLight;
    ctx.beginPath();
    ctx.arc(tentX, tentY + 20, 90, 0, Math.PI * 2);
    ctx.fill();

    // Tent geometry
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(tentX - 45, tentY + 45);
    ctx.lineTo(tentX, tentY);
    ctx.lineTo(tentX + 45, tentY + 45);
    ctx.closePath();
    ctx.fill();

    // Headlamp beam pointing to night sky
    const beamGrad = ctx.createLinearGradient(tentX + 90, tentY + 15, tentX + 320, tentY - 260);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(tentX + 90, tentY + 15);
    ctx.lineTo(tentX + 280, tentY - 280);
    ctx.lineTo(tentX + 360, tentY - 240);
    ctx.closePath();
    ctx.fill();

  } else if (type === 'architecture') {
    // 11mm Interior Cathedral / Modern Geometric Atrium
    // Deep slate interior walls
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Dynamic Symmetrical Vault Lines (Showcases Tokina 11mm barrel distortion & correction)
    const centerX = width / 2;
    const archGrad = ctx.createLinearGradient(0, 0, 0, height);
    archGrad.addColorStop(0, '#f8fafc');
    archGrad.addColorStop(0.5, '#cbd5e1');
    archGrad.addColorStop(1, '#475569');

    // Ribbed ceiling arcs
    for (let i = 0; i < 9; i++) {
      const span = 140 + i * 90;
      ctx.strokeStyle = archGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(centerX, 0, span, 420 + i * 40, 0, 0, Math.PI);
      ctx.stroke();
    }

    // Stained Glass / Large Skylight at End of Hall (Subject / Window Pull target)
    const windowGrad = ctx.createRadialGradient(centerX, height * 0.45, 10, centerX, height * 0.45, 220);
    windowGrad.addColorStop(0, '#ffffff');
    windowGrad.addColorStop(0.3, '#bae6fd');
    windowGrad.addColorStop(0.7, '#38bdf8');
    windowGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = windowGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, height * 0.45, 140, 240, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marble floor with glossy reflections
    const floorGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
    floorGrad.addColorStop(0, '#1e293b');
    floorGrad.addColorStop(0.5, '#334155');
    floorGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // Perspective floor tiles converging to center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let x = -width; x < width * 2; x += 180) {
      ctx.beginPath();
      ctx.moveTo(centerX, height * 0.58);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Subject: Person standing in center aisle admiring architecture
    ctx.fillStyle = '#e11d48'; // Bright magenta-red coat
    ctx.beginPath();
    ctx.ellipse(centerX, height * 0.68, 14, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.arc(centerX, height * 0.64, 8, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Golden Hour Sunset Beach with Tokina 11-16mm Sunstar
    // Sky
    const sunsetSky = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    sunsetSky.addColorStop(0, '#431407');
    sunsetSky.addColorStop(0.25, '#c2410c');
    sunsetSky.addColorStop(0.65, '#ea580c');
    sunsetSky.addColorStop(0.85, '#f59e0b');
    sunsetSky.addColorStop(1, '#fef08a');
    ctx.fillStyle = sunsetSky;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Sunstar - Tokina 11-16mm famous 9-blade 18-point star!
    const sunX = width * 0.32;
    const sunY = height * 0.38;

    // Glowing disk
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunGlow.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
    sunGlow.addColorStop(0.6, 'rgba(249, 115, 22, 0.35)');
    sunGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
    ctx.fill();

    // 18 Rays of the Tokina Sunstar
    ctx.save();
    ctx.translate(sunX, sunY);
    for (let r = 0; r < 18; r++) {
      ctx.rotate((Math.PI * 2) / 18);
      const rayGrad = ctx.createLinearGradient(0, 0, 260, 0);
      rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      rayGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.5)');
      rayGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(260, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Ocean Waves
    const seaGrad = ctx.createLinearGradient(0, height * 0.58, 0, height * 0.82);
    seaGrad.addColorStop(0, '#78350f');
    seaGrad.addColorStop(0.4, '#92400e');
    seaGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, height * 0.58, width, height * 0.25);

    // Golden sun path reflection on water
    const pathGrad = ctx.createLinearGradient(sunX - 160, 0, sunX + 160, 0);
    pathGrad.addColorStop(0, 'rgba(254, 240, 138, 0)');
    pathGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.85)');
    pathGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = pathGrad;
    for (let y = height * 0.6; y < height * 0.82; y += 8) {
      const spread = (y - height * 0.6) * 1.6;
      ctx.fillRect(sunX - spread, y, spread * 2, 4);
    }

    // Wet sand shoreline & Foreground Cliff (Rich shadow detail)
    const sandGrad = ctx.createLinearGradient(0, height * 0.78, 0, height);
    sandGrad.addColorStop(0, '#451a03');
    sandGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.78);
    ctx.bezierCurveTo(width * 0.3, height * 0.72, width * 0.6, height * 0.86, width, height * 0.78);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Subject: Surfer carrying surfboard along shoreline (Great Subject Masking candidate!)
    const surferX = width * 0.68;
    const surferY = height * 0.72;
    // Surfer silhouette with golden rim light
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(surferX, surferY + 40, 18, 38, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(surferX, surferY, 12, 0, Math.PI * 2);
    ctx.fill();
    // Surfboard
    ctx.save();
    ctx.translate(surferX - 25, surferY + 20);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-landscape',
    title: 'Danau Pegunungan Alpen',
    subtitle: 'Nikon D3400 • Tokina 11-16mm @ 11mm • f/8.0 • 1/250s • ISO 100',
    category: 'Lanskap Ultra-Wide',
    specs: '11mm Ultra-Wide, Sensor 24.2 MP, Komposisi Batu Depan & Subjek',
    dataUrl: createSamplePhoto('landscape'),
  },
  {
    id: 'sample-astro',
    title: 'Galaksi Bimasakti (Milky Way)',
    subtitle: 'Nikon D3400 • Tokina 11-16mm @ 11mm • f/2.8 • 25s • ISO 3200',
    category: 'Astrophotography & Night',
    specs: '11mm f/2.8 Constant Aperture, Nebulae Core, Subjek Tenda Bercahaya',
    dataUrl: createSamplePhoto('astro'),
  },
  {
    id: 'sample-architecture',
    title: 'Katedral Simetris & Interior',
    subtitle: 'Nikon D3400 • Tokina 11-16mm @ 11mm • f/5.6 • 1/60s • ISO 400',
    category: 'Arsitektur & Interior Pro',
    specs: 'Koreksi Distorsi Barel 11mm, Garis Tegak Lurus Presisi, Jendela Terang',
    dataUrl: createSamplePhoto('architecture'),
  },
  {
    id: 'sample-golden',
    title: 'Golden Sunset & Sunstar Tokina',
    subtitle: 'Nikon D3400 • Tokina 11-16mm @ 11mm • f/16 • 1/125s • ISO 100',
    category: 'Sunset & Sunstar Flare',
    specs: '9-Blade Diaphragm 18-Point Sunstar, Rim Light Subjek Surfer, Refleksi Ombak',
    dataUrl: createSamplePhoto('golden_hour'),
  },
];
