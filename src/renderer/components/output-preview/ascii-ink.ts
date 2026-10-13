const INK_SHADE = 0.55;
const LIGHT_PAPER_LUMA = 0.6;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;

export const isLightPaper = (hex: string): boolean => {
  const value = parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return (red * LUMA_RED + green * LUMA_GREEN + blue * LUMA_BLUE) / 255 > LIGHT_PAPER_LUMA;
};

export const glyphInk = (red: number, green: number, blue: number, lightPaper: boolean): string => {
  const shade = lightPaper ? INK_SHADE : 1;
  return `rgb(${Math.round(red * shade)},${Math.round(green * shade)},${Math.round(blue * shade)})`;
};
