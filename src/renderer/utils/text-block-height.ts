export const textBlockHeight = (lineCount: number, fontSize: number, lineHeight: number): number =>
  Math.ceil(fontSize * (1 + (Math.max(1, lineCount) - 1) * lineHeight));

export const halfLeading = (fontSize: number, lineHeight: number): number =>
  ((lineHeight - 1) * fontSize) / 2;
