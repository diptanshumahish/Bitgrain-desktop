import React from "react";

interface FadeRailProps {
  ariaLabel: string;
  gapClass: string;
  children: React.ReactNode;
}

const FADE_EDGE = "pointer-events-none absolute inset-y-0 z-[1] w-6";
const FADE_TONE = "from-brand-primary dark:from-[#09090b]";

export const FadeRail: React.FC<FadeRailProps> = ({ ariaLabel, gapClass, children }) => (
  <div className="relative -mx-6 min-w-0 md:mx-0">
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex snap-x scroll-px-6 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden ${gapClass}`}
    >
      {children}
    </div>
    <span aria-hidden="true" className={`${FADE_EDGE} left-0 bg-linear-to-r md:hidden ${FADE_TONE}`} />
    <span aria-hidden="true" className={`${FADE_EDGE} right-0 bg-linear-to-l ${FADE_TONE}`} />
  </div>
);
