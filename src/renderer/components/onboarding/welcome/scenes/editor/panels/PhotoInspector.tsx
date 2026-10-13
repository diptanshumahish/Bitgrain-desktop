import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { SWAPPED_PHOTO } from "../timeline/editor-photos";
import { POSTER_ORIGINAL_PHOTO } from "../timeline/poster-template";

const ADJUSTMENTS: { label: string; fillClass: string }[] = [
  { label: "Brightness", fillClass: "w-[55%]" },
  { label: "Warmth", fillClass: "w-[70%]" },
];

export const PhotoInspector: React.FC = () => {
  const { photo } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-2.5">
        <img src={photo === "swapped" ? SWAPPED_PHOTO : POSTER_ORIGINAL_PHOTO} alt="" className="h-11 w-9 rounded object-cover ring-1 ring-white/15" />
        <span className="text-[11px] leading-snug text-white/60">{photo === "swapped" ? "hotel-red.jpg" : "portrait.jpg"}<br /><span className="text-white/35">Fill, cover</span></span>
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
