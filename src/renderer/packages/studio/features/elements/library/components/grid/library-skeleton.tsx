import React from "react";

const SKELETON_TILE_COUNT = 18;
const SKELETON_KEYS = Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => `skeleton-${index}`);

export const LibrarySkeleton: React.FC = () => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-x-3 gap-y-5" aria-hidden="true">
    {SKELETON_KEYS.map((key) => (
      <div key={key} className="flex flex-col gap-2">
        <div className="h-36 rounded-lg bg-[var(--s-bg-input)] animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-[var(--s-bg-input)] animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-[var(--s-bg-input)] animate-pulse" />
      </div>
    ))}
  </div>
);
