import type { InspectorPanel } from "../toolbar-types";

const INSPECTOR_TITLES: Record<InspectorPanel, string> = {
  effects: "Look",
  algorithm: "Dither",
  halftone: "Halftone",
  popart: "Pop art",
  ascii: "ASCII art",
  braille: "Braille",
  contour: "Contour",
  inkwash: "Ink wash",
  manga: "Manga",
  styles: "Styles",
  presets: "Presets",
  adjust: "Adjust",
  tone: "Tone",
  filters: "Filters",
  "haze-bloom": "Haze and glow",
  colour: "Colour",
  palette: "Palette",
  lut: "Film grade",
  export: "Export",
  effect: "Effect",
  finish: "Paper texture",
};

export const inspectorTitle = (panel: InspectorPanel): string => INSPECTOR_TITLES[panel];
