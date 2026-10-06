import { signal } from "../../../lib/signal";

// The timeline's active tool. The web build had exactly one behaviour, select,
// with trim handles on the clip edges. On desktop the same drag means different
// edits depending on the tool in hand, which is how every professional timeline
// works and what makes ripple and roll reachable without a modifier chord.
export type TimelineTool =
  | "select"
  | "razor"
  | "ripple"
  | "roll"
  | "slip"
  | "slide";

export interface ToolDefinition {
  id: TimelineTool;
  label: string;
  // Single-key shortcut, matched against KeyboardEvent.code.
  code: string;
  hint: string;
}

export const TIMELINE_TOOLS: ToolDefinition[] = [
  { id: "select", label: "Select", code: "KeyV", hint: "Move clips and drag their edges" },
  { id: "razor", label: "Razor", code: "KeyC", hint: "Click a clip to cut it where you click" },
  { id: "ripple", label: "Ripple", code: "KeyR", hint: "Trim an edge and pull the rest of the track with it" },
  { id: "roll", label: "Roll", code: "KeyN", hint: "Drag a cut; both clips change, the track does not" },
  { id: "slip", label: "Slip", code: "KeyY", hint: "Drag the media inside a clip without moving it" },
  { id: "slide", label: "Slide", code: "KeyU", hint: "Move a clip; its neighbours absorb the change" },
];

export const activeToolSignal = signal<TimelineTool>("select");

export function setTool(tool: TimelineTool): void {
  activeToolSignal.value = tool;
}

export function toolForCode(code: string): TimelineTool | null {
  return TIMELINE_TOOLS.find((t) => t.code === code)?.id ?? null;
}

// The cursor each tool puts on the timeline, so the pointer says which edit a
// drag is about to perform before it happens.
export function cursorForTool(tool: TimelineTool): string {
  switch (tool) {
    case "razor":
      return "crosshair";
    case "ripple":
    case "roll":
      return "col-resize";
    case "slip":
    case "slide":
      return "ew-resize";
    default:
      return "";
  }
}
