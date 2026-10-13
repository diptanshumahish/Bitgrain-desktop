import type { Layer, TextLayer } from "../../../data/studioTypes";
import { layoutPlainText } from "../hooks/export/text/text-layout";
import { textBlockHeight } from "../../../utils/text-block-height";

let measureContext: CanvasRenderingContext2D | null = null;

const getMeasureContext = (): CanvasRenderingContext2D | null => {
  if (!measureContext) measureContext = document.createElement("canvas").getContext("2d");
  return measureContext;
};

const baseFontFor = (layer: TextLayer): string => {
  const style = layer.fontStyle === "italic" ? "italic" : "normal";
  return `${style} ${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
};

const wrappedHeight = (layer: TextLayer): number | null => {
  const context = getMeasureContext();
  if (!context) return null;
  const lineCount = layoutPlainText(context, layer, 1, baseFontFor(layer)).length;
  return textBlockHeight(lineCount, layer.fontSize, layer.lineHeight);
};

export function growFixedTextToFit(layer: Layer | null, content: string): Partial<TextLayer> {
  if (!layer || layer.type !== "text" || layer.autoResize) return {};
  const needed = wrappedHeight({ ...layer, content });
  if (needed === null || needed <= layer.height) return {};
  return { height: needed };
}
