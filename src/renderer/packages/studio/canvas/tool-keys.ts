import type { CanvasTool } from "./canvas-tool-event";

const PLAIN_TOOL_KEYS: Record<string, CanvasTool> = {
  h: "grab",
  v: "select",
  b: "brush",
  f: "frame",
};

const PLACEMENT_TOOL_KEYS: Record<string, CanvasTool> = {
  r: "rect",
  t: "text",
};

export const TOOL_EVENT_NAMES: Record<CanvasTool, string> = {
  select: "select",
  grab: "grab",
  pen: "pen",
  pencil: "pencil",
  brush: "brush",
  frame: "frame",
  rect: "rectangle",
  text: "text",
};

export const toolForKey = (key: string, shiftKey: boolean, altKey: boolean): CanvasTool | null => {
  const lower = key.toLowerCase();
  if (lower === "p") return shiftKey ? "pencil" : "pen";
  if (PLAIN_TOOL_KEYS[lower]) return PLAIN_TOOL_KEYS[lower];
  if (!altKey && PLACEMENT_TOOL_KEYS[lower]) return PLACEMENT_TOOL_KEYS[lower];
  return null;
};
