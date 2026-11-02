import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import type { EditorFrame, EditorPalette } from "./editor-frame-store";
import { ORIGINAL_HEADLINE } from "./poster-template";
import { recolour } from "./editor-palettes";
import { headlineFontSize, headlineFor } from "./headline-text";

export interface PosterName {
  firstName: string;
  lastName: string;
}

const typedHeadline = (layer: Layer, frame: EditorFrame, name: PosterName): Layer => {
  if (layer.type !== "text") return layer;
  if (frame.typedLetters === null) return { ...layer, content: ORIGINAL_HEADLINE };
  const full = headlineFor(name.firstName, name.lastName);
  return { ...layer, content: full.slice(0, frame.typedLetters), fontSize: headlineFontSize(full) };
};

const paintLayer = (layer: Layer, palette: EditorPalette): Layer => {
  if (layer.type === "shape") return { ...layer, fill: recolour(layer.fill, palette) };
  if (layer.type === "vector") return { ...layer, fill: recolour(layer.fill, palette), strokeColor: recolour(layer.strokeColor, palette) };
  if (layer.type === "text") return { ...layer, color: recolour(layer.color, palette) };
  return layer;
};

const restyleLayer = (layer: Layer, frame: EditorFrame, name: PosterName): Layer => {
  const painted = paintLayer(layer, frame.palette);
  if (layer.id === "photo") return { ...painted, visible: frame.photo === "swapped" };
  if (layer.id === "headline") return typedHeadline(painted, frame, name);
  return painted;
};

export const buildFrameTemplate = (base: TemplateDef, frame: EditorFrame, name: PosterName): TemplateDef => ({
  ...base,
  background: recolour(base.background, frame.palette),
  layers: base.layers.map((layer) => restyleLayer(layer, frame, name)),
});

export const headlineLength = (name: PosterName): number => headlineFor(name.firstName, name.lastName).length;
