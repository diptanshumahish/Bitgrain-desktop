import { emitCanvasTool, type CanvasTool } from "../../../canvas/canvas-tool-event";
import type { PaletteEntry } from "./palette-entry";

interface ToolSpec {
  tool: CanvasTool;
  label: string;
  shortcut: string;
  keywords: string[];
}

const TOOL_SPECS: ToolSpec[] = [
  { tool: "select", label: "Select and move", shortcut: "V", keywords: ["pointer", "arrow", "move", "select", "pick", "cursor"] },
  { tool: "text", label: "Text tool", shortcut: "T", keywords: ["type", "heading", "words", "font", "write", "click to type"] },
  { tool: "rect", label: "Rectangle tool", shortcut: "R", keywords: ["shape", "box", "square", "draw box"] },
  { tool: "frame", label: "Frame tool", shortcut: "F", keywords: ["artboard", "container", "clip", "new page", "draw page", "crop area"] },
  { tool: "pen", label: "Pen tool", shortcut: "P", keywords: ["vector", "bezier", "path", "draw", "custom shape", "outline", "curve"] },
  { tool: "pencil", label: "Pencil tool", shortcut: "⇧ P", keywords: ["freehand", "sketch", "draw", "scribble", "hand drawn"] },
  { tool: "brush", label: "Brush tool", shortcut: "B", keywords: ["paint", "ink", "draw", "marker", "brush stroke", "doodle"] },
  { tool: "grab", label: "Hand tool, pan the canvas", shortcut: "H", keywords: ["pan", "scroll", "move view", "move around", "navigate", "grab"] },
];

export const TOOL_ENTRIES: PaletteEntry[] = TOOL_SPECS.map((spec) => ({
  id: `tool-${spec.tool}`,
  label: spec.label,
  group: "Tools",
  keywords: spec.keywords,
  shortcut: spec.shortcut,
  run: () => emitCanvasTool(spec.tool),
}));
