import { relativeLuminance } from "../../../utils/color-theory";

const HEX_RGB_LENGTH = 7;

const luminanceOf = (hex: string): number => relativeLuminance(hex.slice(0, HEX_RGB_LENGTH));

const byLuminance = (colours: string[]): string[] =>
  [...colours].sort((first, second) => luminanceOf(first) - luminanceOf(second));

// Pairs the darkest group colour with the darkest page colour and the lightest with the lightest,
// spreading the ones in between across the page palette.
export const matchColoursByLuminance = (groupColours: string[], pageColours: string[]): Map<string, string> => {
  const swaps = new Map<string, string>();
  if (groupColours.length === 0 || pageColours.length === 0) return swaps;
  const sortedGroup = byLuminance(groupColours);
  const sortedPage = byLuminance(pageColours);
  const lastGroupIndex = Math.max(1, sortedGroup.length - 1);
  sortedGroup.forEach((colour, index) => {
    const rank = sortedGroup.length === 1 ? 0.5 : index / lastGroupIndex;
    swaps.set(colour, sortedPage[Math.round(rank * (sortedPage.length - 1))]);
  });
  return swaps;
};
