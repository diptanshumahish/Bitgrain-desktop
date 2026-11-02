import type { AudioRegion } from "@bitgrain/studio-core/animate/audio/render-audio-region";
import type { SoundFrameCache } from "../engine/sound-frame-cache";
import type { SoundFramePlan } from "@bitgrain/engine/loop/sound-frame-plan";
import { paintSoundFrame } from "@bitgrain/engine/loop/paint-sound-frame";
import { startAudioRegionClock, type AudioRegionClock } from "./audio-region-clock";

interface SoundPlayerOptions {
  canvas: HTMLCanvasElement;
  cache: SoundFrameCache;
  fps: number;
}

export interface SoundPlayer {
  setPlan: (plan: SoundFramePlan) => void;
  play: (region: AudioRegion) => void;
  pause: () => void;
  dispose: () => void;
}

interface PlayerState {
  plan: SoundFramePlan | null;
  clock: AudioRegionClock | null;
  index: number;
  drawn: string;
  rafId: number;
}

const matchCanvasTo = (canvas: HTMLCanvasElement, bitmap: ImageBitmap): void => {
  if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
  if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
};

export const createSoundPlayer = (options: SoundPlayerOptions): SoundPlayer => {
  const state: PlayerState = { plan: null, clock: null, index: 0, drawn: "", rafId: 0 };

  const draw = (): void => {
    const plan = state.plan;
    if (!plan || plan.frames.length === 0) return;
    if (state.clock) state.index = Math.floor(state.clock.elapsed() * options.fps) % plan.frames.length;
    const frame = plan.frames[state.index];
    const bitmap = options.cache.frameFor(frame.key);
    const stamp = `${state.index}:${frame.key}`;
    const context = options.canvas.getContext("2d");
    if (!bitmap || !context || stamp === state.drawn) return;
    matchCanvasTo(options.canvas, bitmap);
    paintSoundFrame(context, bitmap, frame);
    state.drawn = stamp;
  };

  const tick = (): void => {
    draw();
    state.rafId = requestAnimationFrame(tick);
  };
  state.rafId = requestAnimationFrame(tick);

  const pause = (): void => {
    state.clock?.stop();
    state.clock = null;
  };

  return {
    setPlan: (plan) => {
      state.plan = plan;
      state.drawn = "";
      if (state.index >= plan.frames.length) state.index = 0;
    },
    play: (region) => {
      pause();
      state.clock = startAudioRegionClock(region);
    },
    pause,
    dispose: () => {
      cancelAnimationFrame(state.rafId);
      pause();
    },
  };
};
