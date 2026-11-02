import type React from "react";
import type { WorkspaceAppearance, WorkspacePattern } from "../../state/workspace-appearance-store";
import { adaptiveDotSpacing } from "../canvas-transform";

const PATTERN_IMAGES: Record<WorkspacePattern, string> = {
  dots: "radial-gradient(circle, var(--s-dot) 1px, transparent 1px)",
  grid: "linear-gradient(var(--s-dot) 1px, transparent 1px), linear-gradient(90deg, var(--s-dot) 1px, transparent 1px)",
  none: "none",
};

export const workspacePatternStyle = (appearance: WorkspaceAppearance, zoom: number): React.CSSProperties => {
  const dotSpacing = adaptiveDotSpacing(zoom);
  return {
    backgroundColor: appearance.background ?? undefined,
    backgroundImage: PATTERN_IMAGES[appearance.pattern],
    backgroundSize: appearance.pattern === "none" ? undefined : `${dotSpacing}px ${dotSpacing}px`,
  };
};
