export interface WipeBlock {
  x: number;
  y: number;
  delay: number;
}

const DISTANCE_SHARE = 0.62;
const DELAY_JITTER = 0.2;

export const planWipeBlocks = (width: number, height: number, blockSize: number): WipeBlock[] => {
  const originX = width / 2;
  const originY = height;
  const farthest = Math.hypot(width, height);
  const blocks: WipeBlock[] = [];
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      const distance = Math.hypot(x - originX, y - originY) / farthest;
      blocks.push({ x, y, delay: distance * DISTANCE_SHARE + Math.random() * DELAY_JITTER });
    }
  }
  return blocks;
};
