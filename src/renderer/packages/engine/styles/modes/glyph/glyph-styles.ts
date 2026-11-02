import type { CellStyleDefinition } from "../../engine/style-definition";
import type { ParamSpec } from "../../engine/style-types";
import { textParam } from "../../engine/resolve-params";
import { cellHash } from "../../engine/seeded-random";
import { GATE_BASE_DENSE, GATE_BASE_LIGHT } from "../../finish/cell-tone";
import { cellSizeParam, TEXT_FINISH_DEFAULTS } from "../shared-params";
import { drawGlyphCells, EDGES_KEY, RANDOM_GLYPHS_KEY } from "./draw-glyph-cells";
import { GLYPH_POOLS, MIXED_POOLS, RAMP_OPTIONS, rampGlyphs } from "./glyph-ramps";
import { FORENSIC_RAMP_ID } from "./forensic-glyphs";

const RAMP_KEY = "ramp";

const randomGlyphsParam: ParamSpec = {
  kind: "toggle", key: RANDOM_GLYPHS_KEY, label: "Random characters", default: false, advanced: true,
};

const edgesParam: ParamSpec = {
  kind: "number", key: EDGES_KEY, label: "Edges", min: 0, max: 100, step: 1, default: 0, advanced: true, hint: "Brighter, denser marks along outlines",
};

const splitGlyphs = (glyphs: string): readonly string[] => [...glyphs];

export const CHARACTERS_STYLE: CellStyleDefinition = {
  id: "characters",
  label: "Characters",
  hint: "Classic ASCII in the photo's colours",
  glyph: "@#",
  category: "ascii",
  kind: "cells",
  finishDefaults: TEXT_FINISH_DEFAULTS,
  params: [
    cellSizeParam("Size"),
    { kind: "select", key: RAMP_KEY, label: "Characters", options: RAMP_OPTIONS, default: "standard" },
    edgesParam,
    randomGlyphsParam,
  ],
  drawCells: (input) => {
    const rampId = textParam(input.params, RAMP_KEY);
    const ramp = splitGlyphs(rampGlyphs(rampId));
    drawGlyphCells(input, { gateBase: GATE_BASE_DENSE, rescaleAboveGate: false, bitmapGlyphs: rampId === FORENSIC_RAMP_ID, rampFor: () => ramp });
  },
};

interface PoolStyleSpec {
  id: string;
  label: string;
  hint: string;
  glyph: string;
  pool: string;
  gateBase: number;
  category: CellStyleDefinition["category"];
  finishDefaults?: CellStyleDefinition["finishDefaults"];
}

const poolStyle = (spec: PoolStyleSpec): CellStyleDefinition => {
  const ramp = splitGlyphs(spec.pool);
  const light = spec.gateBase === GATE_BASE_LIGHT;
  return {
    id: spec.id, label: spec.label, hint: spec.hint, glyph: spec.glyph, category: spec.category, kind: "cells",
    finishDefaults: spec.finishDefaults,
    params: [cellSizeParam("Size"), edgesParam, randomGlyphsParam],
    drawCells: (input) => drawGlyphCells(input, { gateBase: spec.gateBase, rescaleAboveGate: light, rampFor: () => ramp }),
  };
};

export const BLOCK_STYLE = poolStyle({
  id: "block", label: "Block", hint: "Shaded blocks", glyph: "▓", pool: GLYPH_POOLS.block, gateBase: GATE_BASE_DENSE, category: "ascii", finishDefaults: TEXT_FINISH_DEFAULTS,
});
export const CROSS_STYLE = poolStyle({
  id: "cross", label: "Cross", hint: "Plus marks on the light", glyph: "╋", pool: GLYPH_POOLS.cross, gateBase: GATE_BASE_DENSE, category: "geometric", finishDefaults: TEXT_FINISH_DEFAULTS,
});
export const DIAMOND_STYLE = poolStyle({
  id: "diamond", label: "Diamond", hint: "Small diamonds", glyph: "◆", pool: GLYPH_POOLS.diamond, gateBase: GATE_BASE_DENSE, category: "geometric", finishDefaults: TEXT_FINISH_DEFAULTS,
});
export const LINES_STYLE = poolStyle({
  id: "lines", label: "Lines", hint: "Bars that thin in shadow", glyph: "▌", pool: GLYPH_POOLS.lines, gateBase: GATE_BASE_LIGHT, category: "geometric", finishDefaults: TEXT_FINISH_DEFAULTS,
});
export const DIAGONAL_STYLE = poolStyle({
  id: "diagonal", label: "Diagonal", hint: "Slanted strokes", glyph: "╲", pool: GLYPH_POOLS.diagonal, gateBase: GATE_BASE_LIGHT, category: "geometric", finishDefaults: TEXT_FINISH_DEFAULTS,
});

const mixedRamps = MIXED_POOLS.map(splitGlyphs);

export const MIXED_STYLE: CellStyleDefinition = {
  id: "mixed",
  label: "Mixed",
  hint: "A patchwork of glyph families",
  glyph: "╳◆",
  category: "ascii",
  kind: "cells",
  finishDefaults: TEXT_FINISH_DEFAULTS,
  params: [cellSizeParam("Size"), edgesParam, randomGlyphsParam],
  drawCells: (input) =>
    drawGlyphCells(input, {
      gateBase: GATE_BASE_LIGHT,
      rescaleAboveGate: true,
      rampFor: (column, row) => mixedRamps[cellHash(column, row) % mixedRamps.length],
    }),
};
