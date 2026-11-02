import type { ColorGrade } from "../engine/grade-types";
import { applyGrade } from "../engine/apply-grade";
import type { MaskLayer } from "../mask/mask-types";
import { activeMaskLayers, toWorkerMask } from "../mask/mask-defaults";
import { applyLocalMasks, type BrushAlphaMap } from "../mask/apply-local-masks";
import { rasterizeBrushAlpha } from "../mask/brush-alpha";
import { loadBrushImage } from "../mask/canvas/brush-image-cache";

const loadBrushAlphas = async (masks: MaskLayer[], width: number, height: number): Promise<BrushAlphaMap> => {
  const entries = await Promise.all(
    masks.flatMap((mask) => (mask.area.brush ? [[mask.id, mask.area.brush] as const] : [])).map(
      async ([id, brush]) => [id, rasterizeBrushAlpha(await loadBrushImage(brush), width, height)] as const,
    ),
  );
  return Object.fromEntries(entries);
};

export const runPixelPass = async (
  canvas: HTMLCanvasElement,
  grade: ColorGrade | undefined,
  masks: MaskLayer[] | undefined,
): Promise<Float32Array | null> => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  applyGrade(image.data, grade);
  const active = activeMaskLayers(masks);
  const brushAlphas = await loadBrushAlphas(active, width, height);
  const { effectAlpha } = applyLocalMasks({ data: image.data, width, height, masks: active.map(toWorkerMask), brushAlphas });
  ctx.putImageData(image, 0, 0);
  return effectAlpha;
};
