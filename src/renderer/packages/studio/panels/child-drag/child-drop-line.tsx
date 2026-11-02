import React from "react";
import type { DropEdge } from "./child-drag-signals";

interface ChildDropLineProps {
  edge: DropEdge | null;
}

export const ChildDropLine: React.FC<ChildDropLineProps> = ({ edge }) => {
  if (!edge) return null;
  const position = edge === "above" ? "-top-px" : "-bottom-px";
  return <div className={`pointer-events-none absolute ${position} left-3 right-3 h-[2px] bg-[var(--s-accent)] rounded-full z-10`} />;
};
