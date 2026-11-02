import type { FlatItem, MaskScopeItem } from "./mask-scope";

type DrawItems = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, items: FlatItem[]) => Promise<void>;

interface ScopeLayer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

const scopeLayer = (source: HTMLCanvasElement): ScopeLayer => {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");
  return { canvas, ctx };
};

export const drawMaskScope = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scope: MaskScopeItem,
  drawItems: DrawItems,
): Promise<void> => {
  const members = scopeLayer(canvas);
  const mask = scopeLayer(canvas);
  await drawItems(members.ctx, members.canvas, scope.members);
  await drawItems(mask.ctx, mask.canvas, [scope.mask]);
  members.ctx.globalCompositeOperation = "destination-in";
  members.ctx.drawImage(mask.canvas, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(members.canvas, 0, 0);
  ctx.restore();
};
