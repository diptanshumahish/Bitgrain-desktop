import type { TemplateDef } from "../../../../../data/studioTypes";
import { POSTER_TEMPLATE } from "../editor/timeline/poster-template";
import { buildFrameTemplate, headlineLength, type PosterName } from "../editor/timeline/build-frame-template";
import { INITIAL_EDITOR_FRAME } from "../editor/timeline/editor-frame-store";

export const buildFinalPoster = (name: PosterName): TemplateDef =>
  buildFrameTemplate(
    POSTER_TEMPLATE,
    { ...INITIAL_EDITOR_FRAME, loaded: true, typedLetters: headlineLength(name), photo: "swapped", palette: "rose" },
    name,
  );

export const layersTemplate = (template: TemplateDef, layerIds: string[]): TemplateDef => ({
  ...template,
  background: "transparent",
  layers: template.layers.filter((layer) => layerIds.includes(layer.id)),
});
