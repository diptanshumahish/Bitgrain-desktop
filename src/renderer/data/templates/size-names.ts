import type { TemplateDimensions } from "../../lib/template-cards/template-summary";
import { studioDisplaySize } from "../../lib/template-cards/studio-display-size";

const RATIO_TOLERANCE = 0.012;

interface SizeName {
  ratio: number;
  name: string;
  categories?: string[];
}

const SIZE_NAMES: SizeName[] = [
  { ratio: 1.25, name: "Instagram portrait" },
  { ratio: 1, name: "Album cover", categories: ["album"] },
  { ratio: 1, name: "Square post" },
  { ratio: 16 / 9, name: "Phone wallpaper", categories: ["wallpaper"] },
  { ratio: 16 / 9, name: "Instagram story" },
  { ratio: 9 / 16, name: "YouTube thumbnail", categories: ["thumbnail"] },
  { ratio: 9 / 16, name: "Desktop wallpaper", categories: ["wallpaper"] },
  { ratio: 9 / 16, name: "Widescreen slide" },
  { ratio: Math.SQRT2, name: "A4 portrait" },
  { ratio: Math.SQRT1_2, name: "A4 landscape" },
  { ratio: 1.5, name: "Book cover", categories: ["book-cover"] },
  { ratio: 1.6, name: "Kindle cover" },
  { ratio: 1.4, name: "5 × 7 card" },
  { ratio: 600 / 1050, name: "Business card" },
  { ratio: 630 / 1200, name: "Link preview" },
  { ratio: 2.165, name: "Phone wallpaper", categories: ["wallpaper"] },
  { ratio: 2.165, name: "Phone screen" },
  { ratio: 1.586, name: "Portrait ID card" },
  { ratio: 1 / 1.586, name: "ID card" },
  { ratio: 0.25, name: "LinkedIn banner" },
  { ratio: 1 / 3, name: "X header" },
  { ratio: 1400 / 4800, name: "Billboard" },
];

const matchesRatio = (entry: SizeName, ratio: number, category: string): boolean =>
  Math.abs(entry.ratio - ratio) <= RATIO_TOLERANCE &&
  (!entry.categories || entry.categories.includes(category));

function sizeUseName(size: TemplateDimensions, category: string): string | null {
  if (size.width <= 0) return null;
  const ratio = size.height / size.width;
  return SIZE_NAMES.find((entry) => matchesRatio(entry, ratio, category))?.name ?? null;
}

function formatPixelSize(size: TemplateDimensions): string {
  const display = studioDisplaySize(size);
  return `${display.width} × ${display.height}`;
}

export function describeTemplateSize(size: TemplateDimensions, category: string, fallback: string): string {
  const useName = sizeUseName(size, category) ?? fallback;
  return `${useName}, ${formatPixelSize(size)}`;
}
