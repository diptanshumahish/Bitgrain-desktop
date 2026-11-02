import React from "react";
import { COLLAGE_POSITIONS } from "./collage-positions";

const FALLBACK_TILES = [
  { label: "Posters", note: "Gigs and walls", tone: "bg-accent-orange h-[200px]" },
  { label: "Social", note: "Posts and stories", tone: "bg-accent-purple h-[230px]" },
  { label: "Album covers", note: "Records and singles", tone: "bg-accent-lime h-[200px]" },
];

export const HeroCollageFallback: React.FC = () => (
  <>
    {FALLBACK_TILES.map((tile, index) => (
      <span
        key={tile.label}
        className={`flex shrink-0 flex-col justify-end rounded-xl border border-zinc-900/15 p-4 shadow-lg shadow-zinc-900/10 ${tile.tone} ${COLLAGE_POSITIONS[index]}`}
      >
        <span className="text-[15px] font-bold text-zinc-900">{tile.label}</span>
        <span className="text-[11px] text-zinc-800/80">{tile.note}</span>
      </span>
    ))}
  </>
);
