import React from "react";

const ICON_SIZE = 12;

export type CornerPosition = "top-left" | "top-right" | "bottom-right" | "bottom-left";

const ROTATION_CLASS: Record<CornerPosition, string> = {
  "top-left": "rotate-0",
  "top-right": "rotate-90",
  "bottom-right": "rotate-180",
  "bottom-left": "-rotate-90",
};

export const CornerIcon: React.FC<{ corner: CornerPosition }> = ({ corner }) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={ROTATION_CLASS[corner]} aria-hidden="true">
    <path d="M21 5h-9a7 7 0 0 0-7 7v8" />
  </svg>
);

export const SmoothingIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
  </svg>
);
