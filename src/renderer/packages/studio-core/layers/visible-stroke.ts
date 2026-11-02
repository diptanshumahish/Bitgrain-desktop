const INVISIBLE_STROKES = ["", "none", "transparent"];

export const hasVisibleStroke = (stroke: string | undefined): boolean =>
  !INVISIBLE_STROKES.includes((stroke ?? "").trim().toLowerCase());
