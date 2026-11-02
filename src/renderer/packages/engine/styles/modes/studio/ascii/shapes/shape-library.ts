import type { SelectOption } from "../../../../engine/style-types";
import { GEOMETRY_SHAPES, type ShapeDefinition } from "./shape-geometry";
import { STAR_AND_HATCH_SHAPES } from "./shape-stars";
import { BITMAP_SHAPES } from "./shape-bitmaps";

interface ShapeSet {
  id: string;
  label: string;
  shapes: readonly string[];
}

const SHAPE_LIBRARY: Readonly<Record<string, ShapeDefinition>> = {
  ...GEOMETRY_SHAPES,
  ...STAR_AND_HATCH_SHAPES,
  ...BITMAP_SHAPES,
};

export const DEFAULT_SHAPE_SET = "rings";

const SHAPE_SETS: readonly ShapeSet[] = [
  { id: "rings", label: "Dots and rings", shapes: ["ringThin", "ring", "dotRing", "circle"] },
  { id: "basic", label: "Basic geometry", shapes: ["diamond", "triangle", "square", "circle"] },
  { id: "squares", label: "Squares", shapes: ["squareRing", "sqRoundRing", "sqRound", "sqDot"] },
  { id: "stars", label: "Stars", shapes: ["star6", "star5", "star4", "spark"] },
  { id: "hatch", label: "Hatching", shapes: ["grid4", "hatch3", "hatch2", "hline"] },
  { id: "mixed", label: "Mixed", shapes: ["ring", "diamond", "star5", "circle"] },
  { id: "soft", label: "Soft", shapes: ["petal", "donut", "bullseye", "hex"] },
  { id: "signs", label: "Signs", shapes: ["cross", "asterisk", "plus", "xmark"] },
  { id: "arcade", label: "Arcade", shapes: ["invader", "invader2", "ghost", "smiley"] },
  { id: "arrows", label: "Arrows", shapes: ["chevUp", "chevDn", "corner", "vline"] },
  { id: "pixels", label: "Pixels", shapes: ["checker", "pixel", "grid4", "square"] },
];

export const SHAPE_SET_OPTIONS: readonly SelectOption[] = SHAPE_SETS.map((set) => ({ value: set.id, label: set.label }));

export const shapeSetFor = (id: string): readonly ShapeDefinition[] =>
  (SHAPE_SETS.find((set) => set.id === id) ?? SHAPE_SETS[0]).shapes.map((name) => SHAPE_LIBRARY[name]);

export const SHAPE_SET_IDS: readonly string[] = SHAPE_SETS.map((set) => set.id);

export const MIX_OPTIONS: readonly SelectOption[] = [
  { value: "ramp", label: "By brightness" },
  { value: "interleave", label: "Dithered" },
  { value: "checker", label: "Checker" },
  { value: "noise", label: "Sprinkled" },
  { value: "stack", label: "Nested" },
  { value: "random", label: "Random" },
];
