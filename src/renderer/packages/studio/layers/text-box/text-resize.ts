import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { applyResize } from "@bitgrain/studio-core/layers/studio-layers";
import { fittedTextHeight } from "./text-fit-height";
import { resolveTextSizing, sizingPatch } from "@bitgrain/studio-core/text/layout/text-sizing";

const MIN_FONT_SIZE = 4;

type TextBox = Pick<TextLayer, "x" | "y" | "width" | "height">;

const resizedBox = (layer: TextLayer, dir: HandleDir, dx: number, dy: number, aspect: boolean): TextBox =>
  ({ ...layer, ...applyResize(layer, dir, dx, dy, aspect) }) as TextBox;

const scaleWithCorner = (layer: TextLayer, dir: HandleDir, dx: number, dy: number): Partial<TextLayer> => {
  const box = resizedBox(layer, dir, dx, dy, true);
  const ratio = box.width / layer.width;
  return {
    ...box,
    fontSize: Math.max(MIN_FONT_SIZE, layer.fontSize * ratio),
    letterSpacing: layer.letterSpacing * ratio,
  };
};

const reflowWidth = (layer: TextLayer, dir: HandleDir, dx: number): Partial<TextLayer> => {
  const box = resizedBox(layer, dir, dx, 0, false);
  if (resolveTextSizing(layer) === "fixed" || layer.textPath) return { x: box.x, width: box.width };
  const height = fittedTextHeight({ ...layer, ...box });
  return { x: box.x, width: box.width, height, ...sizingPatch("auto-height") };
};

const stretchHeight = (layer: TextLayer, dir: HandleDir, dy: number): Partial<TextLayer> => {
  const box = resizedBox(layer, dir, 0, dy, false);
  const height = Math.max(fittedTextHeight(layer), box.height);
  const y = dir.includes("n") ? layer.y + layer.height - height : layer.y;
  return { y, height, ...sizingPatch("fixed") };
};

export const resizeTextLayer = (layer: TextLayer, dir: HandleDir, dx: number, dy: number): Partial<TextLayer> => {
  if (dir.length === 2) return scaleWithCorner(layer, dir, dx, dy);
  if (dir === "e" || dir === "w") return reflowWidth(layer, dir, dx);
  return stretchHeight(layer, dir, dy);
};
