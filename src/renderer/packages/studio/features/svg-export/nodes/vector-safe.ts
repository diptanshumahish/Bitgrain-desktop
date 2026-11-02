import type { ImageFilters, Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { usesAdvancedLayout } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { visibleTextEffects } from "@bitgrain/studio-core/text/effects/text-shadow-specs";

const COMMON_KEYS = [
  "id", "type", "name", "x", "y", "width", "height", "opacity", "locked", "visible", "blendMode", "flipH", "flipV",
  "patternCell", "anim", "animTracks", "tokenRefs", "constraints", "layoutSizingH", "layoutSizingV", "layoutAbsolute", "rotation",
  "component", "instance",
];

const STROKE_KEYS = ["strokeWidth", "lineCap", "lineJoin", "dashStyle", "strokeAlign", "dashPattern", "fillGradient", "fill", "fillVar"];

const KEYS_BY_TYPE: Partial<Record<Layer["type"], string[]>> = {
  shape: [
    ...STROKE_KEYS, "shapeType", "stroke", "strokeVar", "borderRadius", "cornerRadii", "cornerSmoothing", "starPoints",
    "starInnerRatio", "polygonSides", "arcStart", "arcSweep", "arcInnerRatio", "startCap", "endCap",
  ],
  vector: [...STROKE_KEYS, "path", "strokeColor", "strokeColorVar", "fillImage", "drawProgress"],
  ink: ["strokes", "viewW", "viewH", "color", "colorVar", "drawProgress"],
  upload: ["src", "fit", "borderRadius", "cornerRadii", "cornerSmoothing", "filters", "crop"],
  image: ["src", "fit", "borderRadius", "cornerRadii", "cornerSmoothing", "filters", "crop"],
  text: [
    "content", "fontSize", "fontWeight", "fontFamily", "fontStyle", "color", "colorVar", "textStyleId", "align", "letterSpacing",
    "lineHeight", "textTransform", "textDecoration", "autoResize", "richContent", "sizing", "verticalAlign", "paragraphSpacing",
    "paragraphIndent", "listStyles", "maxLines", "fontFeatures", "fontVariations", "effects", "gradientText", "textPath",
  ],
};

const DEFAULT_FILTER_VALUE: Readonly<Record<string, number>> = { brightness: 100, contrast: 100, saturation: 100 };

const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || value === false || (Array.isArray(value) && value.length === 0);

const isNeutralFilters = (filters: ImageFilters | undefined): boolean =>
  !filters || Object.entries(filters).every(([name, value]) => typeof value !== "number" || value === (DEFAULT_FILTER_VALUE[name] ?? 0));

const hasOnlyKnownKeys = (layer: Layer, allowed: string[]): boolean =>
  Object.entries(layer).every(([key, value]) => COMMON_KEYS.includes(key) || allowed.includes(key) || isEmptyValue(value));

const isPlainText = (layer: TextLayer): boolean =>
  !layer.textPath && visibleTextEffects(layer.effects ?? []).length === 0 && !layer.gradientText?.enabled && !usesAdvancedLayout(layer);

export const canExportAsVector = (layer: Layer): boolean => {
  const allowed = KEYS_BY_TYPE[layer.type];
  if (!allowed || !hasOnlyKnownKeys(layer, allowed)) return false;
  if (layer.type === "text") return isPlainText(layer);
  if (layer.type === "upload" || layer.type === "image") return isNeutralFilters(layer.filters);
  return true;
};
