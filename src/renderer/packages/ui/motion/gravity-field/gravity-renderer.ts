import { fitCanvas, type FittedCanvas } from "../shared/fit-canvas";
import { createFrameLoop } from "../shared/frame-loop";
import { lerp } from "../shared/math";
import type { Point } from "../shared/point";
import { readCssToken } from "../shared/read-css-token";
import { drawGravityFrame, RIPPLE_DURATION_MS, type Ripple } from "./draw-gravity-frame";

const FOLLOW = 0.18;
const REST_TOKEN = "--s-border";
const ACTIVE_TOKEN = "--s-text-muted";

interface GravityState {
  fitted: FittedCanvas | null;
  target: Point | null;
  pointer: Point | null;
  ripple: Ripple | null;
}

export interface GravityRenderer {
  resize: () => void;
  aim: (target: Point | null) => void;
  pulse: (origin: Point) => void;
  stop: () => void;
}

const stepPointer = (state: GravityState): void => {
  if (!state.target) {
    state.pointer = null;
    return;
  }
  state.pointer = state.pointer
    ? { x: lerp(state.pointer.x, state.target.x, FOLLOW), y: lerp(state.pointer.y, state.target.y, FOLLOW) }
    : { ...state.target };
};

const rippleDone = (ripple: Ripple | null, time: number): boolean => !ripple || time - ripple.startTime > RIPPLE_DURATION_MS;

export const createGravityRenderer = (canvas: HTMLCanvasElement): GravityRenderer => {
  const state: GravityState = { fitted: null, target: null, pointer: null, ripple: null };
  const draw = (time: number): void => {
    if (!state.fitted) return;
    const restColor = readCssToken(canvas, REST_TOKEN);
    drawGravityFrame({ ...state.fitted, pointer: state.pointer, ripple: state.ripple, time, restColor, activeColor: readCssToken(canvas, ACTIVE_TOKEN) });
  };
  const loop = createFrameLoop((time) => {
    stepPointer(state);
    if (rippleDone(state.ripple, time)) state.ripple = null;
    draw(time);
    return state.target !== null || state.ripple !== null;
  });
  return {
    resize: () => {
      state.fitted = fitCanvas(canvas);
      draw(performance.now());
    },
    aim: (target) => {
      state.target = target;
      loop.start();
    },
    pulse: (origin) => {
      state.ripple = { ...origin, startTime: performance.now() };
      loop.start();
    },
    stop: loop.stop,
  };
};
