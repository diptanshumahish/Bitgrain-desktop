import React, { useId } from "react";

const GRAIN_FREQUENCY = "0.8";
const GRAIN_OCTAVES = 2;

export const WelcomeBackdrop: React.FC = () => {
  const filterId = useId();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,255,255,0.14),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.22] mix-blend-soft-light">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency={GRAIN_FREQUENCY} numOctaves={GRAIN_OCTAVES} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
};
