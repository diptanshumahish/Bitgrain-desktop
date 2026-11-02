import type { TextVerticalAlign } from "../../model/text-layout-types";

const VERTICAL_FACTOR: Record<TextVerticalAlign, number> = {
  top: 0,
  middle: 0.5,
  bottom: 1,
};

const JUSTIFY_BY_VERTICAL: Record<TextVerticalAlign, "flex-start" | "center" | "flex-end"> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

export const verticalOffset = (align: TextVerticalAlign | undefined, boxHeight: number, contentHeight: number): number =>
  (boxHeight - contentHeight) * VERTICAL_FACTOR[align ?? "top"];

export const verticalJustify = (align: TextVerticalAlign | undefined): "flex-start" | "center" | "flex-end" =>
  JUSTIFY_BY_VERTICAL[align ?? "top"];
