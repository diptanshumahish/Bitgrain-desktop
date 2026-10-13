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

export function emitInsertElement(request: InsertElementRequest): void {
  window.dispatchEvent(new CustomEvent<InsertElementRequest>(INSERT_ELEMENT_EVENT, { detail: request }));
}

export function onInsertElement(handler: (request: InsertElementRequest) => void): () => void {
  const listener = (event: Event): void => handler((event as CustomEvent<InsertElementRequest>).detail);
  window.addEventListener(INSERT_ELEMENT_EVENT, listener);
  return () => window.removeEventListener(INSERT_ELEMENT_EVENT, listener);
}
