import type { DropdownOption } from "../../../ui/dropdown";
import type { HorizontalConstraint, VerticalConstraint } from "@bitgrain/studio-core/model/auto-layout-types";

export const HORIZONTAL_CONSTRAINT_OPTIONS: DropdownOption[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "left-right", label: "Left and right" },
  { value: "center", label: "Center" },
  { value: "scale", label: "Scale" },
];

export const VERTICAL_CONSTRAINT_OPTIONS: DropdownOption[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "top-bottom", label: "Top and bottom" },
  { value: "center", label: "Center" },
  { value: "scale", label: "Scale" },
];

export const pickHorizontal = (
  current: HorizontalConstraint,
  side: "left" | "right" | "center",
  extend: boolean,
): HorizontalConstraint => {
  if (side === "center") return "center";
  const opposite = side === "left" ? "right" : "left";
  if (extend && (current === opposite || current === "left-right")) return "left-right";
  return side;
};

export const pickVertical = (
  current: VerticalConstraint,
  side: "top" | "bottom" | "center",
  extend: boolean,
): VerticalConstraint => {
  if (side === "center") return "center";
  const opposite = side === "top" ? "bottom" : "top";
  if (extend && (current === opposite || current === "top-bottom")) return "top-bottom";
  return side;
};
