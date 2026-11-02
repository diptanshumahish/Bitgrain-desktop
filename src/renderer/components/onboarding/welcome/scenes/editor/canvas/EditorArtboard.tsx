import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { TemplateThumbnail } from "../../../../../templates/TemplateThumbnail";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { POSTER_TEMPLATE } from "../timeline/poster-template";
import { buildFrameTemplate, type PosterName } from "../timeline/build-frame-template";
import { LAYER_BOXES } from "./layer-boxes";
import { SelectionBox } from "./SelectionBox";
import { DropZone } from "./DropZone";

interface EditorArtboardProps {
  name: PosterName;
}

export const EditorArtboard: React.FC<EditorArtboardProps> = ({ name }) => {
  const frame = useSignalValue(editorFrameSignal);
  const template = buildFrameTemplate(POSTER_TEMPLATE, frame, name);

  return (
    <div className="relative aspect-[1240/1754] h-[84%]">
      <div className={`absolute inset-0 flex items-center justify-center rounded-sm border border-dashed border-white/20 text-[11px] text-white/35 transition-opacity duration-300 ${frame.loaded ? "opacity-0" : "opacity-100"}`}>
        Blank page
      </div>
      <div className={`absolute inset-0 overflow-hidden shadow-2xl shadow-black/70 transition-all duration-700 ease-out ${frame.loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <TemplateThumbnail template={template} />
      </div>
      {LAYER_BOXES.map(({ target, label, boxClass, showFor }) => (
        <span key={target} data-target={target} className={`absolute ${boxClass}`}>
          {target === "photo" && <DropZone />}
          <SelectionBox label={label} visible={showFor.includes(frame.selection)} />
        </span>
      ))}
      <span className="absolute -bottom-6 left-0 text-[10px] text-white/40">1240 × 1754</span>
    </div>
  );
};
