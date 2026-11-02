import type { TextLayer } from "../../model/studio-types";
import type { TextSizing } from "../../model/text-layout-types";

export const resolveTextSizing = (layer: Pick<TextLayer, "sizing" | "autoResize">): TextSizing => {
  if (layer.sizing) return layer.sizing;
  return layer.autoResize ? "auto-width" : "auto-height";
};

export const sizingPatch = (sizing: TextSizing): Pick<TextLayer, "sizing" | "autoResize"> => ({
  sizing,
  autoResize: sizing === "auto-width",
});
