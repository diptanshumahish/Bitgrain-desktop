const GREYSCALE = 0;

export const saturationFor = (isColor: boolean | undefined, saturation: number): number =>
  isColor === false ? GREYSCALE : saturation;
