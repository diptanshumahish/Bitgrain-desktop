export function hexToRgbTuple(
  hex: string | undefined,
  fallback: [number, number, number],
): [number, number, number] {
  if (!hex) return fallback;
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  if (clean.length < 6) return fallback;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return fallback;
  return [r, g, b];
}
