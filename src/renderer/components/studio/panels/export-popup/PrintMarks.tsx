import React from "react";

const CROP_MARK_POSITIONS = [
  "-top-px -left-6 w-4 h-px",
  "-top-6 -left-px w-px h-4",
  "-top-px -right-6 w-4 h-px",
  "-top-6 -right-px w-px h-4",
  "-bottom-px -left-6 w-4 h-px",
  "-bottom-6 -left-px w-px h-4",
  "-bottom-px -right-6 w-4 h-px",
  "-bottom-6 -right-px w-px h-4",
];

export const PrintMarks: React.FC = () => (
  <>
    <span className="absolute -inset-[7px] border border-dashed border-red-400/80 rounded-[2px] pointer-events-none" />
    <span className="absolute inset-[6%] border border-dashed border-sky-400/80 pointer-events-none" />
    {CROP_MARK_POSITIONS.map((position) => (
      <span key={position} className={`absolute bg-[var(--s-text)] pointer-events-none ${position}`} />
    ))}
  </>
);
