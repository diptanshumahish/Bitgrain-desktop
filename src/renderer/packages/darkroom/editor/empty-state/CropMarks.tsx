import React from "react";

const CORNER_CLASSES = [
  "-top-3 -left-3 border-t border-l",
  "-top-3 -right-3 border-t border-r",
  "-bottom-3 -left-3 border-b border-l",
  "-bottom-3 -right-3 border-b border-r",
];

export const CropMarks: React.FC = () => (
  <>
    {CORNER_CLASSES.map((cornerClass) => (
      <span
        key={cornerClass}
        aria-hidden="true"
        className={`absolute w-4 h-4 border-[var(--s-text-muted)] opacity-60 transition-colors group-hover:border-[var(--s-border-strong)] ${cornerClass}`}
      />
    ))}
  </>
);
