import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { MOTION_BLUR_STYLE } from "./blur/motion-blur-style";
import { TILT_SHIFT_STYLE } from "./blur/tilt-shift-style";
import { SOFT_FOCUS_STYLE } from "./blur/soft-focus-style";
import { RADIAL_BLUR_STYLE } from "./blur/radial-blur-style";
import { MOTION_BLUR_LOOKS, RADIAL_BLUR_LOOKS, SOFT_FOCUS_LOOKS, TILT_SHIFT_LOOKS } from "./distort-looks";

export const DISTORT_STYLES: readonly StyleDefinition[] = [
  MOTION_BLUR_STYLE, TILT_SHIFT_STYLE, SOFT_FOCUS_STYLE, RADIAL_BLUR_STYLE,
];

export const DISTORT_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  motionblur: MOTION_BLUR_LOOKS,
  tiltshift: TILT_SHIFT_LOOKS,
  gaussianblur: SOFT_FOCUS_LOOKS,
  radialblur: RADIAL_BLUR_LOOKS,
};
