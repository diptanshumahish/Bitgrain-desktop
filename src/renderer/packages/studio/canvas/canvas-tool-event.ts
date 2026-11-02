import { createEventChannel } from "@bitgrain/core/events/event-channel";

const CANVAS_TOOL_EVENT = "bg:canvas-tool";

export type CanvasTool = "select" | "grab" | "pen" | "pencil" | "brush" | "frame" | "rect" | "text";

const canvasToolChannel = createEventChannel<CanvasTool>(CANVAS_TOOL_EVENT);

export const emitCanvasTool = canvasToolChannel.emit;
export const onCanvasTool = canvasToolChannel.on;

