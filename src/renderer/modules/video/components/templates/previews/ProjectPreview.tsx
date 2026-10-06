import React from "react";
import type { OverlayTextPart } from "../../../templates/types";

interface ProjectPreviewProps {
  duration: number;
  titles: OverlayTextPart[];
}

function shortLabel(text: string): string {
  if (text.length <= 8) return text;
  return text.slice(0, 7) + "…";
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ duration, titles }) => {
  const safeDuration = duration > 0 ? duration : 1;
  return (
    <div className="h-12 w-full rounded-md bg-black overflow-hidden flex flex-col gap-0.5 p-1" aria-hidden>
      <div className="relative h-3.5 rounded-sm bg-violet-500/25 border border-violet-400/30 overflow-hidden">
        <span className="absolute inset-y-0 left-1 right-1 flex items-center text-[8.5px] text-white/60">
          Video / Image
        </span>
      </div>
      <div className="relative h-3.5 rounded-sm bg-rose-500/20 border border-rose-400/30 overflow-hidden">
        {titles.map((title, idx) => {
          const left = (title.offset / safeDuration) * 100;
          const width = Math.min(100 - left, (title.duration / safeDuration) * 100);
          return (
            <div
              key={idx}
              className="absolute inset-y-0 bg-rose-400/70 border border-rose-300/50 rounded-sm flex items-center justify-center"
              style={{ left: `${left}%`, width: `${Math.max(8, width)}%` }}
            >
              <span className="text-[8.5px] text-white leading-none truncate px-1">
                {shortLabel(title.text)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] text-white/40 font-mono leading-none">
        <span>0s</span>
        <span>{safeDuration.toFixed(1)}s</span>
      </div>
    </div>
  );
};
