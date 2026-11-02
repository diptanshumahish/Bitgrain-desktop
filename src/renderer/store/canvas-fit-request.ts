import { signal } from "../lib/signal";

export type CanvasViewRequest =
  | { kind: "fit"; requestId: number }
  | { kind: "zoom"; zoom: number; requestId: number };

export const canvasViewRequestSignal = signal<CanvasViewRequest>({ kind: "fit", requestId: 0 });

const nextRequestId = (): number => canvasViewRequestSignal.value.requestId + 1;

export function requestCanvasFit(): void {
  canvasViewRequestSignal.value = { kind: "fit", requestId: nextRequestId() };
}

export function requestCanvasZoom(zoom: number): void {
  canvasViewRequestSignal.value = { kind: "zoom", zoom, requestId: nextRequestId() };
}
