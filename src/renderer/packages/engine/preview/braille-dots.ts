const BRAILLE_FIRST = 0x2800;
const BRAILLE_LAST = 0x28ff;
const DOTS_WIDE = 2;
const DOTS_TALL = 4;
const DOT_RADIUS_RATIO = 0.42;
const FULL_TURN = Math.PI * 2;

const DOT_BITS: ReadonlyArray<ReadonlyArray<number>> = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

export const isBrailleGlyph = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code > BRAILLE_FIRST && code <= BRAILLE_LAST;
};

export const drawBrailleGlyph = (
  ctx: CanvasRenderingContext2D,
  char: string,
  left: number,
  top: number,
  cellWidth: number,
  cellHeight: number,
): void => {
  const mask = char.charCodeAt(0) - BRAILLE_FIRST;
  const stepX = cellWidth / DOTS_WIDE;
  const stepY = cellHeight / DOTS_TALL;
  const radius = Math.min(stepX, stepY) * DOT_RADIUS_RATIO;
  ctx.beginPath();
  for (let row = 0; row < DOTS_TALL; row++) {
    for (let col = 0; col < DOTS_WIDE; col++) {
      if ((mask & DOT_BITS[row][col]) === 0) continue;
      const centerX = left + stepX * (col + 0.5);
      const centerY = top + stepY * (row + 0.5);
      ctx.moveTo(centerX + radius, centerY);
      ctx.arc(centerX, centerY, radius, 0, FULL_TURN);
    }
  }
  ctx.fill();
};
