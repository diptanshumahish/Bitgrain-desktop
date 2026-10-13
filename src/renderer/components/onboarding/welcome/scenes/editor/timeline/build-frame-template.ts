import type { Layer, TemplateDef } from "../../../../../../data/studioTypes";
import type { EditorFrame, EditorPalette } from "./editor-frame-store";
import { POSTER_ORIGINAL_PHOTO } from "./poster-template";
import { SWAPPED_PHOTO } from "./editor-photos";
import { headlineFontSize, headlineFor } from "./headline-text";

interface PaletteColors {
  background: string;
  text: string;
  accent: string;
}

export const PALETTE_COLORS: Record<EditorPalette, PaletteColors> = {
  night: { background: "#0D0D0D", text: "#EFE9DF", accent: "#E9A23B" },
  rose: { background: "#170909", text: "#F7E7DF", accent: "#F0605A" },
};

const ORIGINAL_HEADLINE = "Mara\nQuell";
const ACCENT_LAYER_IDS = new Set(["subtitle", "date-4"]);

export interface PosterName {
  firstName: string;
  lastName: string;
}

const headlineLayer = (layer: Layer, frame: EditorFrame, name: PosterName, color: string): Layer => {
  if (layer.type !== "text") return layer;
  if (frame.typedLetters === null) return { ...layer, content: ORIGINAL_HEADLINE, color };
  const full = headlineFor(name.firstName, name.lastName);
  return { ...layer, content: full.slice(0, frame.typedLetters), fontSize: headlineFontSize(full), color };
};

const restyleLayer = (layer: Layer, frame: EditorFrame, name: PosterName): Layer => {
  const colors = PALETTE_COLORS[frame.palette];
  if (layer.type === "image") return { ...layer, src: frame.photo === "swapped" ? SWAPPED_PHOTO : POSTER_ORIGINAL_PHOTO };
  if (layer.type === "vector") return { ...layer, strokeColor: colors.accent };
  if (layer.type === "shape") return { ...layer, fill: colors.text };
  if (layer.id === "headline") return headlineLayer(layer, frame, name, colors.text);
  if (layer.type !== "text") return layer;
  return { ...layer, color: ACCENT_LAYER_IDS.has(layer.id) ? colors.accent : colors.text };
};

export const buildFrameTemplate = (base: TemplateDef, frame: EditorFrame, name: PosterName): TemplateDef => ({
  ...base,
  background: PALETTE_COLORS[frame.palette].background,
  layers: base.layers.map((layer) => restyleLayer(layer, frame, name)),
});

export const headlineLength = (name: PosterName): number => headlineFor(name.firstName, name.lastName).length;
