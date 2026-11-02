import { signal } from "@bitgrain/core/signal";

interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasPoint {
  x: number;
  y: number;
}

type CanvasViewRequest =
  | { kind: "fit"; requestId: number }
  | { kind: "zoom"; zoom: number; requestId: number }
  | { kind: "focus"; rect: CanvasRect; point: CanvasPoint; requestId: number };

export const canvasViewRequestSignal = signal<CanvasViewRequest>({ kind: "fit", requestId: 0 });

const nextRequestId = (): number => canvasViewRequestSignal.value.requestId + 1;

export function requestCanvasFit(): void {
  canvasViewRequestSignal.value = { kind: "fit", requestId: nextRequestId() };
}

export function requestCanvasZoom(zoom: number): void {
  canvasViewRequestSignal.value = { kind: "zoom", zoom, requestId: nextRequestId() };
}

export function requestCanvasFocus(rect: CanvasRect, point: CanvasPoint): void {
  canvasViewRequestSignal.value = { kind: "focus", rect, point, requestId: nextRequestId() };
}
