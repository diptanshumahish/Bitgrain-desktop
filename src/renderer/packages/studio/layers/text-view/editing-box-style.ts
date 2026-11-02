import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";

interface TextBoxGeometry {
  left: number;
  width: number | string;
  minWidth?: number;
  shift: string;
}

const HALF = 2;

const growingShift = (align: TextLayer["align"]): string => {
  if (align === "center") return "translateX(-50%) ";
  if (align === "right") return "translateX(-100%) ";
  return "";
};

const growingLeft = (layer: TextLayer): number => {
  if (layer.align === "center") return layer.x + layer.width / HALF;
  if (layer.align === "right") return layer.x + layer.width;
  return layer.x;
};

export const textBoxGeometry = (layer: TextLayer, growing: boolean): TextBoxGeometry => {
  if (!growing) return { left: layer.x, width: layer.width, shift: "" };
  return {
    left: growingLeft(layer),
    width: "max-content",
    minWidth: layer.width,
    shift: growingShift(layer.align),
  };
};
