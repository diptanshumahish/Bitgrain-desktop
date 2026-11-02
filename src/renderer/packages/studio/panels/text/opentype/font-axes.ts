import { CURATED_FONTS_HREF } from "@bitgrain/studio-core/fonts/curated-fonts";
import { INDIC_FONTS_HREF } from "@bitgrain/studio-core/fonts/indic-fonts";
import { WORLD_FONTS_HREF } from "@bitgrain/studio-core/fonts/world-fonts";

interface AxisRange {
  min: number;
  max: number;
}

export interface FontAxes {
  weight?: AxisRange;
  width?: AxisRange;
  slant?: AxisRange;
  opticalSize?: AxisRange;
}

const FONT_HREFS = [CURATED_FONTS_HREF, INDIC_FONTS_HREF, WORLD_FONTS_HREF];
const OPSZ_SPEC = /family=([^:&]+):opsz[^@]*@(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)/g;

const unquote = (value: string): string => value.trim().replace(/^['"]|['"]$/g, "");

const primaryFamily = (stack: string): string => unquote(stack.split(",")[0] ?? "");

const numbersIn = (value: string): number[] => (value.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

const toRange = (value: string): AxisRange | undefined => {
  const numbers = numbersIn(value);
  if (numbers.length < 2) return undefined;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min < max ? { min, max } : undefined;
};

const mergeRange = (current: AxisRange | undefined, next: AxisRange | undefined): AxisRange | undefined => {
  if (!next) return current;
  if (!current) return next;
  return { min: Math.min(current.min, next.min), max: Math.max(current.max, next.max) };
};

const opticalSizeRange = (family: string): AxisRange | undefined => {
  for (const href of FONT_HREFS) {
    for (const match of href.matchAll(OPSZ_SPEC)) {
      if (decodeURIComponent(match[1].replaceAll("+", " ")) === family) return { min: Number(match[2]), max: Number(match[3]) };
    }
  }
  return undefined;
};

export const detectFontAxes = (fontStack: string): FontAxes => {
  const family = primaryFamily(fontStack);
  const axes: FontAxes = { opticalSize: opticalSizeRange(family) };
  if (typeof document === "undefined" || !document.fonts) return axes;
  document.fonts.forEach((face) => {
    if (unquote(face.family) !== family) return;
    axes.weight = mergeRange(axes.weight, toRange(face.weight));
    axes.width = mergeRange(axes.width, toRange(face.stretch));
    if (face.style.startsWith("oblique")) axes.slant = mergeRange(axes.slant, toRange(face.style));
  });
  return axes;
};
