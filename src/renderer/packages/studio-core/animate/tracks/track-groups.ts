import type { TrackGroupId } from "../../model/animation-types";

export const TRACK_GROUP_PROPS: Record<TrackGroupId, readonly string[]> = {
  position: ["x", "y"],
  size: ["width", "height"],
  rotation: ["rotation"],
  opacity: ["opacity", "visible"],
  colour: ["fill", "stroke", "strokeColor", "color", "gradientText"],
  stroke: ["strokeWidth", "drawProgress", "dashStyle", "lineCap", "lineJoin"],
  shape: ["borderRadius", "path"],
  type: ["fontSize", "letterSpacing", "lineHeight", "align", "textTransform"],
  layout: ["gap", "padding", "layout", "alignItems", "justifyContent", "wrap", "fit"],
  effects: ["filters", "bitgrainEffect", "tornEdge", "tape", "effects"],
};

export const TRACK_GROUP_ORDER: readonly TrackGroupId[] = [
  "position",
  "size",
  "rotation",
  "opacity",
  "colour",
  "stroke",
  "shape",
  "type",
  "layout",
  "effects",
];

export const TRACK_GROUP_LABELS: Record<TrackGroupId, string> = {
  position: "Position",
  size: "Size",
  rotation: "Rotation",
  opacity: "Opacity",
  colour: "Colour",
  stroke: "Stroke",
  shape: "Shape",
  type: "Type",
  layout: "Layout",
  effects: "Effects",
};

export const groupForProp = (prop: string): TrackGroupId | null =>
  TRACK_GROUP_ORDER.find((group) => TRACK_GROUP_PROPS[group].includes(prop)) ?? null;
