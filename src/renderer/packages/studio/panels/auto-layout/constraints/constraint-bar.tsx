import React from "react";

type BarOrientation = "horizontal" | "vertical";

interface ConstraintBarProps {
  label: string;
  active: boolean;
  orientation: BarOrientation;
  placement: string;
  onPick: (extend: boolean) => void;
}

const LINE_CLASS: Record<BarOrientation, string> = {
  horizontal: "w-full h-[2px]",
  vertical: "h-full w-[2px]",
};

export const ConstraintBar: React.FC<ConstraintBarProps> = ({ label, active, orientation, placement, onPick }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    title={label}
    onClick={(event) => onPick(event.shiftKey)}
    className={`group absolute flex items-center justify-center ${placement}`}
  >
    <span
      className={`block rounded-full transition-colors ${LINE_CLASS[orientation]} ${
        active ? "bg-[var(--s-accent)]" : "bg-[var(--s-text-subtle)] opacity-40 group-hover:opacity-80"
      }`}
    />
  </button>
);
