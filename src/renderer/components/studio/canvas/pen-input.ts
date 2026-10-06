let hasSeenPen = false;

export const notePenInput = (pointerType: string): void => {
  if (pointerType === "pen") hasSeenPen = true;
};

export const shouldDrawWith = (pointerType: string): boolean => {
  if (pointerType === "mouse" || pointerType === "pen") return true;
  return !hasSeenPen;
};
