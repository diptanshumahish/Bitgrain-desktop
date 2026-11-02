interface SplitHeadline {
  opening: string;
  lastWord: string;
}

export const splitLastWord = (headline: string): SplitHeadline => {
  const breakIndex = headline.lastIndexOf(" ");
  if (breakIndex === -1) return { opening: "", lastWord: headline };
  return { opening: headline.slice(0, breakIndex + 1), lastWord: headline.slice(breakIndex + 1) };
};
