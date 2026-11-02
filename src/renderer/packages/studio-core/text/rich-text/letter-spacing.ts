export const parseLetterSpacing = (raw: string, fontSizePx: number): number => {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith("em") ? value * fontSizePx : value;
};

export const setCanvasLetterSpacing = (ctx: CanvasRenderingContext2D, spacingPx: number): void => {
  if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${spacingPx}px`;
};
