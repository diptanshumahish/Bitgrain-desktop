import type { FrameSize } from "../../engine/render-loop-frame";
import type { SoundFrameId, SoundSettings } from "../sound-settings";

interface SoundFrameSpec {
  width: number;
  height: number;
  defaults: Partial<SoundSettings>;
}

const SHORT_EDGE = 1080;
const TALL_EDGE = 1920;
const PORTRAIT_EDGE = 1350;
const MIN_EDGE = 2;

const SPECS: Record<Exclude<SoundFrameId, "photo">, SoundFrameSpec> = {
  canvas: { width: SHORT_EDGE, height: TALL_EDGE, defaults: { seconds: 8, includeAudio: false } },
  reels: { width: SHORT_EDGE, height: TALL_EDGE, defaults: { seconds: 15, includeAudio: true } },
  square: { width: SHORT_EDGE, height: SHORT_EDGE, defaults: { includeAudio: true } },
  portrait: { width: SHORT_EDGE, height: PORTRAIT_EDGE, defaults: { includeAudio: true } },
};

const toEven = (value: number): number => Math.max(MIN_EDGE, Math.round(value / 2) * 2);

export const soundFrameAspect = (frame: SoundFrameId): number | null =>
  frame === "photo" ? null : SPECS[frame].width / SPECS[frame].height;

export const soundFrameSize = (frame: SoundFrameId, maxLongEdge: number): FrameSize | null => {
  if (frame === "photo") return null;
  const spec = SPECS[frame];
  const fit = Math.min(1, maxLongEdge / Math.max(spec.width, spec.height));
  return { width: toEven(spec.width * fit), height: toEven(spec.height * fit) };
};

export const soundFrameDefaults = (frame: SoundFrameId): Partial<SoundSettings> =>
  frame === "photo" ? {} : SPECS[frame].defaults;
