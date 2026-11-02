import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";

export const DropZone: React.FC = () => {
  const { dragging } = useSignalValue(editorFrameSignal);

  return (
    <span className={`pointer-events-none absolute inset-2 flex items-center justify-center rounded border-2 border-dashed border-violet-400 bg-violet-500/15 transition-opacity duration-200 ${dragging ? "opacity-100" : "opacity-0"}`}>
      <span className="rounded bg-violet-500 px-2 py-1 text-[10.5px] font-medium text-white">Drop to replace photo</span>
    </span>
  );
};
