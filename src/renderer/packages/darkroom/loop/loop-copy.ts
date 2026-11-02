import type { LoopFormat, LoopMotion } from "./loop-settings";

export const LOOP_MOTION_HINTS: Record<LoopMotion, string> = {
  grain: "Film grain and paper texture change on every frame",
  boil: "Dots shift and riso inks slip out of register on every frame, like a hand drawn boil",
  "grain-boil": "Grain, the dot pattern and riso inks all move on every frame",
};

const GIF_HINT = "One second that repeats forever, up to 480 pixels";
const FREE_VIDEO_HINT = "Up to 720p, with a watermark";
const PRO_VIDEO_HINT = "Up to 1920 pixels on the long edge";
const WATERMARK_SUFFIX = ", with a watermark";

export const loopSizeHint = (format: LoopFormat, showsWatermark: boolean): string => {
  if (format === "gif") return showsWatermark ? `${GIF_HINT}${WATERMARK_SUFFIX}` : GIF_HINT;
  return showsWatermark ? FREE_VIDEO_HINT : PRO_VIDEO_HINT;
};
