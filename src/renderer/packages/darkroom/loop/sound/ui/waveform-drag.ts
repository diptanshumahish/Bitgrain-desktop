import { clampWindowStart } from "@bitgrain/engine/loop/sound-window";
import type { WaveformView } from "./waveform-paint";

interface WaveformDragOptions {
  view: () => WaveformView;
  onMove: (startSeconds: number) => void;
  onCommit: (startSeconds: number) => void;
}

const KEY_STEP_SECONDS = 1;
const KEY_STEPS: Record<string, number> = { ArrowLeft: -KEY_STEP_SECONDS, ArrowRight: KEY_STEP_SECONDS };

const secondsAt = (canvas: HTMLCanvasElement, clientX: number, duration: number): number => {
  const rect = canvas.getBoundingClientRect();
  return ((clientX - rect.left) / Math.max(1, rect.width)) * duration;
};

const grabOffset = (pointerSeconds: number, view: WaveformView): number => {
  const inside = pointerSeconds >= view.startSeconds && pointerSeconds <= view.startSeconds + view.seconds;
  return inside ? pointerSeconds - view.startSeconds : view.seconds / 2;
};

export const bindWaveformDrag = (canvas: HTMLCanvasElement, options: WaveformDragOptions): (() => void) => {
  const drag = { offset: 0, active: false, start: 0 };

  const startFor = (clientX: number): number => {
    const view = options.view();
    return clampWindowStart(secondsAt(canvas, clientX, view.duration) - drag.offset, view.duration, view.seconds);
  };

  const onPointerDown = (event: PointerEvent): void => {
    const view = options.view();
    drag.offset = grabOffset(secondsAt(canvas, event.clientX, view.duration), view);
    drag.active = true;
    canvas.setPointerCapture(event.pointerId);
    drag.start = startFor(event.clientX);
    options.onMove(drag.start);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!drag.active) return;
    drag.start = startFor(event.clientX);
    options.onMove(drag.start);
  };

  const onPointerUp = (): void => {
    if (!drag.active) return;
    drag.active = false;
    options.onCommit(drag.start);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const step = KEY_STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const view = options.view();
    options.onCommit(clampWindowStart(view.startSeconds + step, view.duration, view.seconds));
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("keydown", onKeyDown);
  return () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("keydown", onKeyDown);
  };
};
