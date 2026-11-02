import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { PHOTO_FILE_NAME } from "../timeline/editor-photos";
import { POSTER_PHOTO } from "../timeline/poster-template";

const ADJUSTMENTS: { label: string; fillClass: string }[] = [
  { label: "Brightness", fillClass: "w-[55%]" },
  { label: "Warmth", fillClass: "w-[70%]" },
];

export const PhotoInspector: React.FC = () => {
  const { photo } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-2.5">
        {photo === "swapped" ? (
          <img src={POSTER_PHOTO} alt="" className="h-10 w-10 rounded object-cover ring-1 ring-white/15" />
        ) : (
          <span className="h-10 w-10 rounded border border-dashed border-white/20" />
        )}
        <span className="text-[11px] leading-snug text-white/60">{photo === "swapped" ? PHOTO_FILE_NAME : "Empty tile"}<br /><span className="text-white/35">Fill, cover</span></span>
      </span>
      {ADJUSTMENTS.map(({ label, fillClass }) => (
        <span key={label} className="flex flex-col gap-1">
          <span className="text-[10.5px] text-white/45">{label}</span>
          <span className="relative h-1 rounded-full bg-white/10">
            <span className={`absolute inset-y-0 left-0 rounded-full bg-violet-500 ${fillClass}`} />
          </span>
        </span>
      ))}
    </div>
  );
};
