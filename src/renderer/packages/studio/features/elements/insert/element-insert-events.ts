import { createEventChannel } from "@bitgrain/core/events/event-channel";

export const ELEMENT_DRAG_MIME = "application/x-bitgrain-element";

const INSERT_ELEMENT_EVENT = "bg:insert-element";

export interface ElementDropPoint {
  pageId: string;
  x: number;
  y: number;
}

export interface InsertElementRequest {
  elementId: string;
  drop: ElementDropPoint | null;
}

const insertElementChannel = createEventChannel<InsertElementRequest>(INSERT_ELEMENT_EVENT);

export const emitInsertElement = insertElementChannel.emit;
export const onInsertElement = insertElementChannel.on;
