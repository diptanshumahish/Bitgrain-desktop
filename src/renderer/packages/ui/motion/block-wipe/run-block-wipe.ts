import { clamp } from "../shared/math";
import { createFrameLoop } from "../shared/frame-loop";
import { readCssToken } from "../shared/read-css-token";
import type { SnapshotOverlay } from "./snapshot-overlay";
import { planWipeBlocks, type WipeBlock } from "./wipe-plan";

const DURATION_MS = 950;
const BLOCK_CSS_PX = 14;
const BLOCK_LIFE = 0.16;
const FLASH_ALPHA = 0.85;
const INK_TOKEN = "--s-text";

const drawBlock = (context: CanvasRenderingContext2D, snapshot: HTMLCanvasElement, block: WipeBlock, size: number, local: number): void => {
  if (local >= 1) return;
  if (local < 0.5) context.drawImage(snapshot, block.x, block.y, size, size, block.x, block.y, size, size);
  const flash = local === 0 ? 0 : 1 - Math.abs(local - 0.5) * 2;
  if (flash <= 0) return;
  context.globalAlpha = flash * FLASH_ALPHA;
  context.fillRect(block.x, block.y, size, size);
  context.globalAlpha = 1;
};

export const runBlockWipe = ({ canvas, snapshot }: SnapshotOverlay): void => {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = Math.max(1, Math.round(BLOCK_CSS_PX * (canvas.width / Math.max(1, canvas.offsetWidth))));
  const blocks = planWipeBlocks(canvas.width, canvas.height, size);
  const ink = readCssToken(canvas, INK_TOKEN);
  const startTime = performance.now();
  const loop = createFrameLoop((now) => {
    const progress = clamp((now - startTime) / DURATION_MS, 0, 1);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = ink;
    blocks.forEach((block) => drawBlock(context, snapshot, block, size, clamp((progress - block.delay) / BLOCK_LIFE, 0, 1)));
    if (progress < 1) return true;
    canvas.remove();
    return false;
  });
  loop.start();
};
