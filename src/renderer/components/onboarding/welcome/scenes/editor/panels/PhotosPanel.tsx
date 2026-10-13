import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { PHOTO_OPTIONS } from "../timeline/editor-photos";

export const PhotosPanel: React.FC = () => {
  const { dragging, photo } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] text-white/40">Your photos</p>
      <div className="grid grid-cols-3 gap-1">
        {PHOTO_OPTIONS.map(({ id, src, isTarget }) => (
          <span
            key={id}
            data-target={isTarget ? "photo-source" : undefined}
            className={`overflow-hidden rounded-md ring-2 transition-all duration-300 ${isTarget && (dragging || photo === "swapped") ? "ring-violet-500" : "ring-transparent"}`}
          >
            <img src={src} alt="" className={`aspect-square w-full object-cover transition-opacity duration-300 ${isTarget && dragging ? "opacity-40" : "opacity-90"}`} />
          </span>
        ))}
      </div>
    </div>
  );
};
