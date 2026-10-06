export type EasingId = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring" | "hold";

export const NUMERIC_PROPS = [
  "x",
  "y",
  "width",
  "height",
  "rotation",
  "opacity",
  "borderRadius",
  "fontSize",
  "strokeWidth",
  "letterSpacing",
  "lineHeight",
  "gap",
  "padding",
  "drawProgress",
] as const;

export const COLOR_PROPS = ["fill", "stroke", "strokeColor", "color"] as const;

export const STEP_PROPS = [
  "dashStyle",
  "lineCap",
  "lineJoin",
  "layout",
  "alignItems",
  "justifyContent",
  "align",
  "fit",
  "textTransform",
] as const;

export const BOOL_PROPS = ["visible", "wrap"] as const;

export const OBJECT_PROPS = [
  "filters",
  "bitgrainEffect",
  "tornEdge",
  "tape",
  "effects",
  "gradientText",
] as const;

export const PATH_PROP = "path";

export type NumericProp = (typeof NUMERIC_PROPS)[number];
export type ColorProp = (typeof COLOR_PROPS)[number];
export type StepProp = (typeof STEP_PROPS)[number];
export type BoolProp = (typeof BOOL_PROPS)[number];
export type ObjectProp = (typeof OBJECT_PROPS)[number];

export const NUMERIC_DEFAULTS: Partial<Record<NumericProp, number>> = {
  drawProgress: 100,
};

export const BOOL_DEFAULTS: Record<BoolProp, boolean> = {
  visible: true,
  wrap: false,
};

export const ANIMATABLE_KEYS: readonly string[] = [
  ...NUMERIC_PROPS,
  ...COLOR_PROPS,
  ...STEP_PROPS,
  ...BOOL_PROPS,
  ...OBJECT_PROPS,
  PATH_PROP,
];

export type LayerAnimState = Partial<Record<NumericProp, number>> &
  Partial<Record<ColorProp, string>> &
  Partial<Record<StepProp, string>> &
  Partial<Record<BoolProp, boolean>> &
  Partial<Record<ObjectProp, unknown>> & {
    path?: import("./studioTypes").VectorPath;
  };

export type LayerAnimMap = Record<string, LayerAnimState>;

export interface AnimationFrameMeta {
  id: string;
  durationMs: number;
  easing: EasingId;
}

export interface PageAnimation {
  frames: AnimationFrameMeta[];
  loop: boolean;
  fps: number;
}

export const DEFAULT_FRAME_DURATION_MS = 600;
export const DEFAULT_ANIMATION_FPS = 30;
