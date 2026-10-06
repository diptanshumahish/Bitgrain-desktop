import React from "react";

const BAR_HEIGHTS = [22, 60, 38, 80, 30, 70, 45, 90, 28, 55, 75, 40, 62, 88, 35, 50];
const BEAT_INDICES = new Set([1, 3, 5, 7, 10, 13]);

interface BeatsPreviewProps {
  active: boolean;
}

export const BeatsPreview: React.FC<BeatsPreviewProps> = ({ active }) => (
  <div className="relative h-12 w-full rounded-md bg-black overflow-hidden flex items-end gap-0.5 p-1" aria-hidden>
    {BAR_HEIGHTS.map((heightPct, idx) => {
      const isBeat = BEAT_INDICES.has(idx);
      const baseClass = isBeat
        ? active
          ? "bg-rose-400 tpl-anim-beat-blip origin-bottom"
          : "bg-rose-400/60 origin-bottom"
        : "bg-white/25 origin-bottom";
      return (
        <div
          key={idx}
          className={`flex-1 rounded-[1px] ${baseClass}`}
          style={{
            height: `${heightPct}%`,
            animationDelay: isBeat && active ? `${idx * 0.12}s` : undefined,
          }}
        />
      );
    })}
  </div>
);
