import type { ImagePlugin, TransformContext, TransformationResult, TransformMode } from './types';
import { AsciiPlugin } from './plugins/ascii';
import { BraillePlugin } from './plugins/braille';
import { ContourPlugin } from './plugins/contour';
import { DitherPlugin } from './plugins/dither';
import { BlockyPlugin, GrungePlugin, DotMatrixPlugin } from './plugins/extra';
import { InvertPlugin, GrayscalePlugin, PixelatePlugin } from './plugins/filters';
import { GrainPlugin } from './plugins/creative';
import { LUTPlugin } from './plugins/lut';
import { HazeBloomPlugin } from './plugins/haze-bloom';
import { HalftonePlugin } from './plugins/halftone';
import { ScanlinesPlugin } from './plugins/scanlines';
import { CrosshatchPlugin } from './plugins/crosshatch';
import { InkWashPlugin } from './plugins/inkwash';
import { MangaPlugin } from './plugins/manga';
import { PopArtPlugin } from './plugins/popart';
import { PhotocopyPlugin, MisprintPlugin } from './plugins/print';
import { FoldPlugin, DustPlugin } from './plugins/paper';
import {
  ColorGradePlugin,
  DuotonePlugin,
  VignettePlugin,
  PosterizePlugin,
  SharpenPlugin,
  ColorWashPlugin,
} from './plugins/grade';
import { getNearestColor } from './utils/color';

// ── HSL helpers for hue rotation ──
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hN = h / 360;
  return [hue2rgb(p, q, hN + 1/3) * 255, hue2rgb(p, q, hN) * 255, hue2rgb(p, q, hN - 1/3) * 255];
}

class PluginRegistry {
  private plugins: Map<TransformMode, ImagePlugin> = new Map();

  constructor() {
    this.register(AsciiPlugin);
    this.register(BraillePlugin);
    this.register(ContourPlugin);
    this.register(DitherPlugin);
    this.register(BlockyPlugin);
    this.register(GrungePlugin);
    this.register(DotMatrixPlugin);
    this.register(InvertPlugin);
    this.register(GrayscalePlugin);
    this.register(PixelatePlugin);
    this.register(GrainPlugin);
    this.register(LUTPlugin);
    this.register(HazeBloomPlugin);
    this.register(HalftonePlugin);
    this.register(ScanlinesPlugin);
    this.register(CrosshatchPlugin);
    this.register(InkWashPlugin);
    this.register(MangaPlugin);
    this.register(PopArtPlugin);
    this.register(PhotocopyPlugin);
    this.register(MisprintPlugin);
    this.register(FoldPlugin);
    this.register(DustPlugin);
    this.register(ColorGradePlugin);
    this.register(DuotonePlugin);
    this.register(VignettePlugin);
    this.register(PosterizePlugin);
    this.register(SharpenPlugin);
    this.register(ColorWashPlugin);
  }

  register(plugin: ImagePlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugin(id: TransformMode): ImagePlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): ImagePlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const registry = new PluginRegistry();

export const runTransform = (mode: TransformMode | TransformMode[], ctx: TransformContext): TransformationResult => {
  const modes = Array.isArray(mode) ? mode : [mode];

  // ── Pre-processing: apply brightness, contrast, saturation, hue to pixel data ──
  const preprocessed = new Float32Array(ctx.data);
  const { contrast, brightness, saturation, hue = 0 } = ctx;
  const needsPreprocess = contrast !== 1 || brightness !== 1 || saturation !== 1 || hue !== 0;

  if (needsPreprocess) {
    for (let i = 0; i < preprocessed.length; i += 4) {
      let r = preprocessed[i];
      let g = preprocessed[i + 1];
      let b = preprocessed[i + 2];

      // Brightness (multiply)
      r *= brightness;
      g *= brightness;
      b *= brightness;

      // Contrast (around midpoint 128)
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;

      // Saturation (mix towards luminance)
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = luma + (r - luma) * saturation;
      g = luma + (g - luma) * saturation;
      b = luma + (b - luma) * saturation;

      // Hue rotation (simplified rotation in RGB space via HSL)
      if (hue !== 0) {
        const [h0, s0, l0] = rgbToHsl(r, g, b);
        const [hr, hg, hb] = hslToRgb(((h0 + hue) % 360 + 360) % 360, s0, l0);
        r = hr; g = hg; b = hb;
      }

      preprocessed[i] = r;
      preprocessed[i + 1] = g;
      preprocessed[i + 2] = b;
    }
  }

  // Pass preprocessed data with adjustments neutralised (plugins shouldn't re-apply)
  let currentCtx: TransformContext = {
    ...ctx,
    data: preprocessed,
    contrast: 1,
    brightness: 1,
    saturation: 1,
  };
  let lastResult: TransformationResult = { colorData: new Uint8ClampedArray(ctx.width * ctx.height * 4) };

  for (const m of modes) {
    const plugin = registry.getPlugin(m);
    if (!plugin) throw new Error(`Plugin not found: ${m}`);
    
    lastResult = plugin.transform(currentCtx);
    
    // If there's another mode, update currentCtx with the working results
    if (lastResult.workingData) {
      currentCtx = { ...currentCtx, data: lastResult.workingData };
    } else if (lastResult.colorData) {
      // Fallback: convert colorData back to Float32Array if workingData is missing
      const newData = new Float32Array(lastResult.colorData.length);
      for (let i = 0; i < lastResult.colorData.length; i++) {
        newData[i] = lastResult.colorData[i];
      }
      currentCtx = { ...currentCtx, data: newData };
    }
  }

  // Global Palette Enforcement: Ensure colorData matches hardware palette if provided
  if (ctx.palette && lastResult.colorData) {
    const colors = lastResult.colorData;
    for (let i = 0; i < colors.length; i += 4) {
      const [r, g, b] = getNearestColor(colors[i], colors[i + 1], colors[i + 2], ctx.palette);
      colors[i] = r;
      colors[i + 1] = g;
      colors[i + 2] = b;
    }
  }

  return lastResult;
};
