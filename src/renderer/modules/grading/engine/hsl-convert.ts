export type ColorTriple = Float32Array;

const DEGREES = 360;
const SECTOR = 60;

const hueFromRgb = (red: number, green: number, blue: number, max: number, delta: number): number => {
  if (max === red) return (((green - blue) / delta + (green < blue ? 6 : 0)) * SECTOR);
  if (max === green) return (((blue - red) / delta + 2) * SECTOR);
  return (((red - green) / delta + 4) * SECTOR);
};

export const rgbToHslInPlace = (color: ColorTriple): void => {
  const red = color[0];
  const green = color[1];
  const blue = color[2];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) {
    color[0] = 0;
    color[1] = 0;
    color[2] = lightness;
    return;
  }
  color[0] = hueFromRgb(red, green, blue, max, delta);
  color[1] = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  color[2] = lightness;
};

const hueToChannel = (low: number, high: number, rawHue: number): number => {
  const hue = rawHue < 0 ? rawHue + 1 : rawHue > 1 ? rawHue - 1 : rawHue;
  if (hue < 1 / 6) return low + (high - low) * 6 * hue;
  if (hue < 1 / 2) return high;
  if (hue < 2 / 3) return low + (high - low) * (2 / 3 - hue) * 6;
  return low;
};

export const hslToRgbInPlace = (color: ColorTriple): void => {
  const hue = (((color[0] % DEGREES) + DEGREES) % DEGREES) / DEGREES;
  const saturation = color[1];
  const lightness = color[2];
  if (saturation === 0) {
    color[0] = lightness;
    color[1] = lightness;
    color[2] = lightness;
    return;
  }
  const high = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const low = 2 * lightness - high;
  color[0] = hueToChannel(low, high, hue + 1 / 3);
  color[1] = hueToChannel(low, high, hue);
  color[2] = hueToChannel(low, high, hue - 1 / 3);
};
