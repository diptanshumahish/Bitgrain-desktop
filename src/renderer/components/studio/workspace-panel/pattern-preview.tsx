import React from "react";
import type { WorkspacePattern } from "../../../store/workspace-appearance-store";

interface PatternPreviewProps {
  pattern: WorkspacePattern;
}

const DOT_POSITIONS = [3, 7, 11];

export const PatternPreview: React.FC<PatternPreviewProps> = ({ pattern }) => (
  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" aria-hidden="true">
    {pattern === "dots" &&
      DOT_POSITIONS.flatMap((x) => DOT_POSITIONS.map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" className="fill-current" />))}
    {pattern === "grid" && (
      <path d="M1 5H13M1 9H13M5 1V13M9 1V13" className="stroke-current" strokeWidth="0.9" fill="none" />
    )}
    {pattern === "none" && <rect x="1.5" y="1.5" width="11" height="11" rx="2" className="stroke-current" strokeWidth="0.9" fill="none" />}
  </svg>
);
