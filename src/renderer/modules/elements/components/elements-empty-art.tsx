import React from "react";

const TILE_CLASS = "fill-current/[0.04] stroke-current/30";

export const ElementsEmptyArt: React.FC = () => (
  <svg viewBox="0 0 208 120" className="w-[208px] h-[120px] text-[var(--s-text-subtle)]" aria-hidden="true">
    <g className="elements-empty-tile elements-empty-tile-1">
      <rect x="4" y="8" width="46" height="46" rx="10" className={TILE_CLASS} strokeDasharray="3 3" />
      <g className="fill-current">
        <circle cx="17" cy="21" r="1.6" /><circle cx="27" cy="21" r="1.6" /><circle cx="37" cy="21" r="1.6" />
        <circle cx="17" cy="31" r="1.6" /><circle cx="27" cy="31" r="1.6" /><circle cx="37" cy="31" r="1.6" />
        <circle cx="17" cy="41" r="1.6" /><circle cx="27" cy="41" r="1.6" /><circle cx="37" cy="41" r="1.6" />
      </g>
      <rect x="15" y="19" width="24" height="24" rx="7" fill="none" className="stroke-current" strokeWidth="1.4" transform="rotate(45 27 31)" />
    </g>
    <g className="elements-empty-tile elements-empty-tile-2">
      <rect x="58" y="8" width="46" height="46" rx="10" className={TILE_CLASS} strokeDasharray="3 3" />
      <g fill="none" className="stroke-current" strokeWidth="1.4">
        <path d="M63 47 a9 9 0 0 1 18 0 M67 47 a5 5 0 0 1 10 0" />
        <path d="M81 47 a9 9 0 0 1 18 0 M85 47 a5 5 0 0 1 10 0" />
        <path d="M72 35 a9 9 0 0 1 18 0 M76 35 a5 5 0 0 1 10 0" />
      </g>
    </g>
    <g className="elements-empty-tile elements-empty-tile-3">
      <rect x="112" y="8" width="46" height="46" rx="10" className={TILE_CLASS} strokeDasharray="3 3" />
      <g fill="none" className="stroke-current" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M119 31 C125 22 139 22 145 31 C139 40 125 40 119 31 Z" />
        <path d="M145 31 L152 25 L152 37 Z" />
        <path d="M130 25 Q134 31 130 37 M136 24.5 Q140 31 136 37.5" />
      </g>
      <circle cx="125" cy="30" r="1.4" className="fill-current" />
    </g>
    <g className="elements-empty-tile elements-empty-tile-4">
      <rect x="166" y="8" width="38" height="46" rx="10" className={TILE_CLASS} strokeDasharray="3 3" />
      <g fill="none" className="stroke-current" strokeWidth="1.4">
        <rect x="176" y="22" width="18" height="18" />
        <rect x="176" y="22" width="18" height="18" transform="rotate(45 185 31)" />
        <circle cx="185" cy="31" r="4" />
      </g>
    </g>
    <g fill="none" className="stroke-current/40" strokeWidth="1.2" strokeLinecap="round">
      <path d="M20 78 H188" strokeDasharray="2 5" />
      <path d="M60 96 L68 88 L76 96 L84 88 L92 96 L100 88 L108 96 L116 88 L124 96 L132 88 L140 96 L148 88" />
    </g>
  </svg>
);
