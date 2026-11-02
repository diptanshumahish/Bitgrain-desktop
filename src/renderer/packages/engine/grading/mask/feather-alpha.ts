const BOX_PASSES = 3;

interface BlurLine {
  start: number;
  stride: number;
  length: number;
}

const blurLine = (source: Float32Array, target: Float32Array, line: BlurLine, radius: number): void => {
  const { start, stride, length } = line;
  const last = length - 1;
  const read = (position: number): number =>
    source[start + Math.min(last, Math.max(0, position)) * stride];
  const windowSize = radius * 2 + 1;
  let sum = 0;
  for (let position = -radius; position <= radius; position += 1) sum += read(position);
  for (let position = 0; position < length; position += 1) {
    target[start + position * stride] = sum / windowSize;
    sum += read(position + radius + 1) - read(position - radius);
  }
};

const blurPass = (alpha: Float32Array, scratch: Float32Array, width: number, height: number, radius: number): void => {
  for (let row = 0; row < height; row += 1) {
    blurLine(alpha, scratch, { start: row * width, stride: 1, length: width }, radius);
  }
  for (let column = 0; column < width; column += 1) {
    blurLine(scratch, alpha, { start: column, stride: width, length: height }, radius);
  }
};

export const featherAlpha = (alpha: Float32Array, width: number, height: number, radius: number): void => {
  const boxRadius = Math.round(radius / BOX_PASSES);
  if (boxRadius < 1) return;
  const scratch = new Float32Array(alpha.length);
  for (let pass = 0; pass < BOX_PASSES; pass += 1) {
    blurPass(alpha, scratch, width, height, boxRadius);
  }
};
