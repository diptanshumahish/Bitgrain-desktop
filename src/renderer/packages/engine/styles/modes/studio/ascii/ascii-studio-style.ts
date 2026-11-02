import type { CellStyleDefinition } from "../../../engine/style-definition";
import { textParam } from "../../../engine/resolve-params";
import { ASCII_STUDIO_PARAMS, GLYPH_KIND_SHAPES, STUDIO_KEYS } from "./ascii-studio-params";
import { buildStudioPass } from "./ascii-studio-pass";
import { drawStudioGlyphs } from "./studio-glyph-draw";
import { drawStudioShapes } from "./studio-shape-draw";

export const ASCII_STUDIO_STYLE: CellStyleDefinition = {
  id: "asciiStudio",
  label: "ASCII studio",
  hint: "Characters or shapes in photo colours or a bold palette",
  glyph: "◍#",
  category: "ascii",
  kind: "cells",
  params: ASCII_STUDIO_PARAMS,
  finishDefaults: { backdrop: "solid", contrast: 0, glow: 30 },
  drawCells: (input) => {
    const pass = buildStudioPass(input);
    if (textParam(input.params, STUDIO_KEYS.glyphs) === GLYPH_KIND_SHAPES) drawStudioShapes(pass);
    else drawStudioGlyphs(pass);
  },
};
