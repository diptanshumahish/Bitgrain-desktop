import type { CSSProperties } from "react";

export const clampStyle = (maxLines: number | undefined): CSSProperties => {
  if (!maxLines || maxLines <= 0) return {};
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: maxLines,
    overflow: "hidden",
  };
};
