import type { Layer, LayerType } from "../../model/studio-types";

export const ROOT_OVERRIDE_KEY = "$root";

const SHARED_KEYS = ["visible"] as const;

const TEXT_KEYS = [
  "content", "richContent", "color", "colorVar", "fontFamily", "fontWeight", "fontStyle",
  "textStyleId", "gradientText", "fills",
] as const;

const AUTO_TEXT_BOX_KEYS = ["width", "height"] as const;

const KEYS_BY_TYPE: Record<LayerType, readonly string[]> = {
  text: TEXT_KEYS,
  shape: ["fill", "fillVar", "stroke", "strokeVar", "fillGradient", "fills"],
  vector: ["fill", "fillVar", "strokeColor", "strokeColorVar", "fillGradient", "fillImage", "fills"],
  ink: ["color", "colorVar"],
  image: ["src", "crop"],
  upload: ["src", "crop"],
  adjustment: [],
  group: [],
  frame: ["background", "backgroundVar", "image", "fills"],
};

export const GEOMETRY_KEYS: ReadonlySet<string> = new Set(AUTO_TEXT_BOX_KEYS);

const hasAutoTextBox = (layer: Layer): boolean =>
  layer.type === "text" && (layer.sizing === "auto-width" || layer.sizing === "auto-height" || Boolean(layer.autoResize));

export const overrideKeysFor = (layer: Layer): string[] => [
  ...SHARED_KEYS,
  ...KEYS_BY_TYPE[layer.type],
  ...(hasAutoTextBox(layer) ? AUTO_TEXT_BOX_KEYS : []),
];

export const INSTANCE_OWNED_KEYS: readonly string[] = [
  "id", "name", "x", "y", "width", "height", "rotation", "opacity", "locked", "visible",
  "blendMode", "flipH", "flipV", "anim", "animTracks", "constraints", "layoutSizingH",
  "layoutSizingV", "layoutAbsolute", "patternCell", "instance",
];

export const readLayerValue = (layer: Layer, key: string): unknown =>
  (layer as unknown as Record<string, unknown>)[key];
