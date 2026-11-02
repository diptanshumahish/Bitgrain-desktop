import React from "react";
import { Redo2, Share2, Undo2 } from "lucide-react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";

export const EditorTopBar: React.FC = () => {
  const { loaded, exported } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-white/10 px-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <img src="/bitgrainlogo.png" alt="" className="h-5 w-5 rounded" />
        <span className="truncate text-[12px] text-white/70">{loaded ? "Night Songs tour poster" : "Untitled design"}</span>
        <span className="hidden items-center gap-1 text-white/35 md:flex">
          <Undo2 size={13} />
          <Redo2 size={13} />
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-white/60 ring-1 ring-white/10 sm:flex">
          <Share2 size={12} />
          Share
        </span>
        <span
          data-target="export"
          className={`rounded-md px-3 py-1.5 text-[12px] font-medium text-black transition-all duration-200 ${exported ? "scale-95 bg-white" : "bg-[#f0e6c4]"}`}
        >
          Export
        </span>
      </span>
    </div>
  );
};
