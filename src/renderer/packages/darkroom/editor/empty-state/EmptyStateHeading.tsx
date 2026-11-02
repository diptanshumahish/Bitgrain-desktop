import React from "react";

// Desktop (PORTED.md): web's "rendered in your browser" subline removed.
export const EmptyStateHeading: React.FC = () => (
  <div className="flex flex-col items-center text-center">
    <h1 className="font-medium text-[var(--s-text)] leading-[1.05] text-balance text-[30px] md:text-[clamp(2rem,4.5vw,3rem)]">
      <span className="hidden md:inline">drop an image, make it </span>
      <span className="md:hidden">pick a photo,<br />make it </span>
      <span className="italic">feel printed.</span>
    </h1>
  </div>
);
