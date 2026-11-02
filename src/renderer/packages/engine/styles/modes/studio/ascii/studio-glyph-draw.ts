import { textParam } from "../../../engine/resolve-params";
import { forEachCell } from "../../../finish/cell-grid";
import { rgbaOf, thinnedByCoverage } from "../../../finish/cell-tone";
import { FORENSIC_GLYPHS, forEachForensicPixel, forensicMask, type ForensicBox } from "../../../postfx/reduce/forensic-glyphs";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { rampGlyphs } from "../../glyph/glyph-ramps";
import { GLYPH_FONT_STACK } from "../../glyph/draw-glyph-cells";
import { FORENSIC_RAMP, STUDIO_KEYS } from "./ascii-studio-params";
import { sampleStudioCell, type StudioCell, type StudioPass } from "./ascii-studio-pass";

const EMPTY_GLYPH = " ";
const CHANNELS = 4;
const ALPHA_MAX = 255;

interface GlyphPlan {
  pass: StudioPass;
  ramp: readonly string[];
  pixels: ImageData | null;
}

const pickGlyph = (plan: GlyphPlan, level: number): string => {
  const position = Math.min(1, Math.max(0, level + plan.pass.tone.rampShift));
  return plan.ramp[Math.min(plan.ramp.length - 1, Math.floor((1 - position) * plan.ramp.length))];
};

const paintBox = (pixels: ImageData, box: ForensicBox, colour: RgbTriple, alpha: number): void => {
  const right = Math.min(pixels.width, box.left + box.width);
  const bottom = Math.min(pixels.height, box.top + box.height);
  for (let y = Math.max(0, box.top); y < bottom; y++) {
    for (let x = Math.max(0, box.left); x < right; x++) {
      const index = (y * pixels.width + x) * CHANNELS;
      pixels.data[index] = colour[0];
      pixels.data[index + 1] = colour[1];
      pixels.data[index + 2] = colour[2];
      pixels.data[index + 3] = alpha;
    }
  }
};

const drawForensicGlyph = (plan: GlyphPlan, pixels: ImageData, cell: StudioCell, glyph: string, column: number, row: number): void => {
  const { cellWidth, cellHeight } = plan.pass.grid;
  const box = { left: column * cellWidth, top: row * cellHeight, width: cellWidth, height: cellHeight };
  const alpha = plan.pass.alpha * ALPHA_MAX;
  forEachForensicPixel(forensicMask(glyph), box, (pixel) => paintBox(pixels, pixel, cell.colour, alpha));
};

const drawGlyphCell = (plan: GlyphPlan, column: number, row: number): void => {
  const { pass } = plan;
  const cell = sampleStudioCell(pass, column, row);
  if (cell.level < pass.gate || thinnedByCoverage(pass.tone, column, row)) return;
  const glyph = pickGlyph(plan, cell.level);
  if (glyph === EMPTY_GLYPH) return;
  if (plan.pixels) {
    drawForensicGlyph(plan, plan.pixels, cell, glyph, column, row);
    return;
  }
  pass.input.layer.fillStyle = rgbaOf(cell.colour, pass.alpha);
  pass.input.layer.fillText(glyph, column * pass.grid.cellWidth, row * pass.grid.cellHeight);
};

export const drawStudioGlyphs = (pass: StudioPass): void => {
  const rampId = textParam(pass.input.params, STUDIO_KEYS.ramp);
  const forensic = rampId === FORENSIC_RAMP;
  const { layer, source } = pass.input;
  const pixels = forensic ? layer.getImageData(0, 0, source.width, source.height) : null;
  const plan: GlyphPlan = { pass, ramp: [...(forensic ? FORENSIC_GLYPHS : rampGlyphs(rampId))], pixels };
  layer.font = `${pass.size}px ${GLYPH_FONT_STACK}`;
  layer.textBaseline = "top";
  forEachCell(pass.grid, (column, row) => drawGlyphCell(plan, column, row));
  if (pixels) layer.putImageData(pixels, 0, 0);
};
