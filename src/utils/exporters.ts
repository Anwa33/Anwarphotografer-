import { AdjustmentSettings, Preset } from '../types/preset';

// Download file trigger helper
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Export canvas image in highest quality
export async function exportHighQualityImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp',
  quality: number = 1.0,
  filenamePrefix: string = 'NikonD3400_Tokina11-16'
): Promise<void> {
  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const ext = format === 'jpeg' ? 'jpg' : format;
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const filename = `${filenamePrefix}_${timestamp}.${ext}`;

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          triggerDownload(blob, filename);
        }
        resolve();
      },
      mimeType,
      quality
    );
  });
}

// Generate Adobe Lightroom / Photoshop Camera Raw .XMP Preset XML
export function generateLightroomXMP(preset: Preset): string {
  const s = preset.settings;
  const l = s.lens;

  return `<?xpacket begin="" id="W5M0MrMpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000 1.000000, 2026/01/01">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    crs:PresetType="Normal"
    crs:Cluster="Nikon D3400 + Tokina 11-16mm f/2.8 AT-X PRO DX"
    crs:UUID="${preset.id}"
    crs:SupportsAmount="True"
    crs:ProcessVersion="15.4"
    crs:CameraModelRestriction="Nikon D3400"
    crs:LensProfileEnable="${l.enabled ? '1' : '0'}"
    crs:LensManualDistortionAmount="${l.distortionCorrection}"
    crs:VignetteCorrection="${l.vignetteRemoval}"
    crs:DefringePurpleAmount="${l.defringePurple}"
    crs:WhiteBalance="Custom"
    crs:Temperature="${Math.round(5500 + s.temperature * 35)}"
    crs:Tint="${s.tint}"
    crs:Exposure2012="${s.exposure.toFixed(2)}"
    crs:Contrast2012="${s.contrast}"
    crs:Highlights2012="${s.highlights}"
    crs:Shadows2012="${s.shadows}"
    crs:Whites2012="${s.whites}"
    crs:Blacks2012="${s.blacks}"
    crs:Texture="${s.texture}"
    crs:Clarity2012="${s.clarity}"
    crs:Dehaze="${s.dehaze}"
    crs:Vibrance="${s.vibrance}"
    crs:Saturation="${s.saturation}"
    crs:Sharpness="${s.sharpening}"
    crs:SharpenRadius="+1.0"
    crs:SharpenDetail="25"
    crs:SharpenEdgeMasking="30"
    crs:LuminanceSmoothing="${s.noiseReduction}"
    crs:ColorNoiseReduction="25"
    crs:PostCropVignetteAmount="${s.vignetteAmount}"
    crs:PostCropVignetteFeather="${s.vignetteFeather}"
    crs:GrainAmount="${s.grainAmount}"
    crs:GrainSize="${s.grainSize}"
    crs:HueAdjustmentRed="${s.hsl.red.hue}"
    crs:HueAdjustmentOrange="${s.hsl.orange.hue}"
    crs:HueAdjustmentYellow="${s.hsl.yellow.hue}"
    crs:HueAdjustmentGreen="${s.hsl.green.hue}"
    crs:HueAdjustmentAqua="${s.hsl.aqua.hue}"
    crs:HueAdjustmentBlue="${s.hsl.blue.hue}"
    crs:HueAdjustmentPurple="${s.hsl.purple.hue}"
    crs:HueAdjustmentMagenta="${s.hsl.magenta.hue}"
    crs:SaturationAdjustmentRed="${s.hsl.red.saturation}"
    crs:SaturationAdjustmentOrange="${s.hsl.orange.saturation}"
    crs:SaturationAdjustmentYellow="${s.hsl.yellow.saturation}"
    crs:SaturationAdjustmentGreen="${s.hsl.green.saturation}"
    crs:SaturationAdjustmentAqua="${s.hsl.aqua.saturation}"
    crs:SaturationAdjustmentBlue="${s.hsl.blue.saturation}"
    crs:SaturationAdjustmentPurple="${s.hsl.purple.saturation}"
    crs:SaturationAdjustmentMagenta="${s.hsl.magenta.saturation}"
    crs:LuminanceAdjustmentRed="${s.hsl.red.luminance}"
    crs:LuminanceAdjustmentOrange="${s.hsl.orange.luminance}"
    crs:LuminanceAdjustmentYellow="${s.hsl.yellow.luminance}"
    crs:LuminanceAdjustmentGreen="${s.hsl.green.luminance}"
    crs:LuminanceAdjustmentAqua="${s.hsl.aqua.luminance}"
    crs:LuminanceAdjustmentBlue="${s.hsl.blue.luminance}"
    crs:LuminanceAdjustmentPurple="${s.hsl.purple.luminance}"
    crs:LuminanceAdjustmentMagenta="${s.hsl.magenta.luminance}"
    crs:SplitToningShadowHue="${s.colorGrading.shadows.hue}"
    crs:SplitToningShadowSaturation="${s.colorGrading.shadows.saturation}"
    crs:SplitToningHighlightHue="${s.colorGrading.highlights.hue}"
    crs:SplitToningHighlightSaturation="${s.colorGrading.highlights.saturation}"
    crs:SplitToningBalance="${s.colorGrading.balance}"
    crs:HasSettings="True">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${preset.name}</rdf:li>
    </rdf:Alt>
   </crs:Name>
   <crs:ToneCurvePV2012>
    <rdf:Seq>
     ${s.curve.rgb.map(pt => `<rdf:li>${pt.x}, ${pt.y}</rdf:li>`).join('\n     ')}
    </rdf:Seq>
   </crs:ToneCurvePV2012>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

// Download .XMP Lightroom Preset
export function exportPresetXMP(preset: Preset) {
  const xmpContent = generateLightroomXMP(preset);
  const blob = new Blob([xmpContent], { type: 'application/rdf+xml;charset=utf-8' });
  const safeName = preset.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerDownload(blob, `${safeName}_NikonD3400_Tokina11-16.xmp`);
}

// Export 3D LUT (.CUBE) for DaVinci Resolve, Premiere Pro, Final Cut
export function exportCubeLUT(settings: AdjustmentSettings, presetName: string = 'Nikon_Tokina_LUT') {
  const lutSize = 17; // 17x17x17 standard LUT
  const lines: string[] = [
    `# 3D LUT generated by Nikon D3400 + Tokina 11-16mm Studio`,
    `TITLE "${presetName}"`,
    `LUT_3D_SIZE ${lutSize}`,
    `DOMAIN_MIN 0.0 0.0 0.0`,
    `DOMAIN_MAX 1.0 1.0 1.0`,
    ``,
  ];

  const expMultiplier = Math.pow(2, settings.exposure * 0.035);
  const contrastFactor = (settings.contrast + 100) / 100;

  for (let b = 0; b < lutSize; b++) {
    for (let g = 0; g < lutSize; g++) {
      for (let r = 0; r < lutSize; r++) {
        let red = r / (lutSize - 1);
        let green = g / (lutSize - 1);
        let blue = b / (lutSize - 1);

        // Apply exposure
        red *= expMultiplier;
        green *= expMultiplier;
        blue *= expMultiplier;

        // Apply WB
        if (settings.temperature !== 0) {
          red += settings.temperature * 0.003;
          blue -= settings.temperature * 0.0025;
        }

        // Apply contrast
        red = (red - 0.5) * contrastFactor + 0.5;
        green = (green - 0.5) * contrastFactor + 0.5;
        blue = (blue - 0.5) * contrastFactor + 0.5;

        // Clamp
        red = Math.max(0, Math.min(1, red));
        green = Math.max(0, Math.min(1, green));
        blue = Math.max(0, Math.min(1, blue));

        lines.push(`${red.toFixed(6)} ${green.toFixed(6)} ${blue.toFixed(6)}`);
      }
    }
  }

  const cubeString = lines.join('\n');
  const blob = new Blob([cubeString], { type: 'text/plain;charset=utf-8' });
  const safeName = presetName.replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerDownload(blob, `${safeName}.cube`);
}

// Export custom preset JSON
export function exportPresetJSON(preset: Preset) {
  const jsonStr = JSON.stringify(preset, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const safeName = preset.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerDownload(blob, `${safeName}.json`);
}

// Export Standalone HTML Application file
export function exportStandaloneHTMLFile() {
  const link = document.createElement('a');
  link.href = '/nikon_d3400_tokina_studio.html';
  link.download = 'Nikon_D3400_Tokina_Studio_1000Presets.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
