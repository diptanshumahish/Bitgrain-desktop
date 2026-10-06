import type {
  PatternKind,
  PatternParams,
} from "../../../utils/pattern-engine";

export interface PatternPresetMeta {
  kind: PatternKind;
  label: string;
  hint: string;
}

export const PATTERN_PRESETS: PatternPresetMeta[] = [
  { kind: "checkerboard", label: "Checkerboard", hint: "Classic alternating grid" },
  { kind: "grid", label: "Grid", hint: "Repeat a shape uniformly" },
  { kind: "stripes", label: "Stripes", hint: "Parallel bars at any angle" },
  { kind: "hex", label: "Hex grid", hint: "Honeycomb tiling" },
  { kind: "mandala", label: "Mandala", hint: "Radial symmetry around a center" },
  { kind: "kaleidoscope", label: "Kaleidoscope", hint: "Mirrored radial petals" },
];

export const defaultParamsFor = (kind: PatternKind): PatternParams => {
  switch (kind) {
    case "checkerboard":
      return {
        kind: "checkerboard",
        params: { rows: 8, cols: 8, cellSize: 60, colorA: "#111111", colorB: "#f5f5f5" },
      };
    case "grid":
      return {
        kind: "grid",
        params: { rows: 6, cols: 6, cellSize: 60, gap: 20, shape: "circle", color: "#820000" },
      };
    case "stripes":
      return {
        kind: "stripes",
        params: { count: 12, thickness: 28, gap: 14, angle: 30, colorA: "#111111", colorB: "#f5f5f5" },
      };
    case "hex":
      return {
        kind: "hex",
        params: { rows: 6, cols: 8, cellSize: 80, color: "#820000" },
      };
    case "mandala":
      return {
        kind: "mandala",
        params: { copies: 12, radius: 180, petalWidth: 40, petalHeight: 120, shape: "rect", color: "#820000" },
      };
    case "kaleidoscope":
      return {
        kind: "kaleidoscope",
        params: { copies: 8, radius: 180, petalWidth: 50, petalHeight: 130, shape: "triangle", color: "#820000" },
      };
  }
};
