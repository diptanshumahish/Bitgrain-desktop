import { fitCanvas, type FittedCanvas } from "../shared/fit-canvas";
import { createFrameLoop } from "../shared/frame-loop";
import { lerp } from "../shared/math";
import type { Point } from "../shared/point";
import { buildDotField, type HalftoneDot } from "./halftone-dots";
import { drawLensFrame, type LensState } from "./draw-lens-frame";

const FOLLOW = 0.16;
const FADE = 0.12;
const SETTLED = 0.01;

interface RendererState {
  lens: LensState;
  fitted: FittedCanvas | null;
  dots: HalftoneDot[];
  target: Point | null;
}

interface LensRenderer {
  rebuild: (image: HTMLImageElement) => void;
  aim: (target: Point | null) => void;
  stop: () => void;
}

const stepLens = (state: RendererState): boolean => {
  if (state.target) {
    state.lens.x = lerp(state.lens.x, state.target.x, FOLLOW);
    state.lens.y = lerp(state.lens.y, state.target.y, FOLLOW);
  }
  state.lens.strength = lerp(state.lens.strength, state.target ? 1 : 0, FADE);
  return state.target !== null || state.lens.strength > SETTLED;
};

export const createLensRenderer = (canvas: HTMLCanvasElement, cell: number, color: string): LensRenderer => {
  const state: RendererState = { lens: { x: 0, y: 0, strength: 0 }, fitted: null, dots: [], target: null };
  const draw = (): void => {
    if (state.fitted) drawLensFrame({ ...state.fitted, dots: state.dots, lens: state.lens, cell, color });
  };
  const loop = createFrameLoop(() => {
    const running = stepLens(state);
    draw();
    return running;
  });
  return {
    rebuild: (image) => {
      state.fitted = fitCanvas(canvas);
      state.dots = state.fitted && image.naturalWidth > 0 ? buildDotField(image, state.fitted.width, state.fitted.height, cell) : [];
      draw();
    },
    aim: (target) => {
      if (target && state.lens.strength <= SETTLED) Object.assign(state.lens, target);
      state.target = target;
      if (target) loop.start();
    },
    stop: loop.stop,
  };
};
