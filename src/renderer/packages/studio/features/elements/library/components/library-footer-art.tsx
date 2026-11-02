import React, { useId } from "react";

const TILE_WIDTH = 96;
const TILE_HEIGHT = 24;
const FLOWING_LINE =
  "M-4 12 L0 12 C10 12 14 4 24 4 C34 4 34 18 25 18 C17 18 18 8 30 8 C42 8 44 16 54 16 C62 16 64 6 72 6 C80 6 84 12 96 12 L100 12";

export const LibraryFooterArt: React.FC = () => {
  const patternId = useId();
  return (
    <svg
      className="hidden md:block flex-1 min-w-0 h-6 text-[var(--s-text-subtle)] opacity-60 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width={TILE_WIDTH} height={TILE_HEIGHT} patternUnits="userSpaceOnUse">
          <path d={FLOWING_LINE} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};
