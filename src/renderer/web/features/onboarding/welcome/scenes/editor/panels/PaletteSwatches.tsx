import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { editorFrameSignal, type EditorPalette } from "../timeline/editor-frame-store";
import { PALETTE_NAMES } from "../timeline/editor-palettes";

const PALETTE_ORDER: EditorPalette[] = ["primaries", "cobalt"];
const PALETTE_CHIPS: Record<EditorPalette, string[]> = {
  primaries: ["bg-[#D93A2B]", "bg-[#EAB43E]", "bg-[#171717]"],
  cobalt: ["bg-[#2C45D3]", "bg-[#F3A98C]", "bg-[#14143A]"],
};

export const PaletteSwatches: React.FC = () => {
  const { palette } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex flex-col gap-1.5">
      {PALETTE_ORDER.map((id) => (
        <span
          key={id}
          data-target={id === "cobalt" ? "palette" : undefined}
          className={`flex items-center justify-between rounded-md px-2 py-1.5 ring-1 transition-all duration-300 ${palette === id ? "bg-white/[0.06] ring-violet-500" : "ring-white/10"}`}
        >
          <span className="text-[11px] text-white/75">{PALETTE_NAMES[id]}</span>
          <span className="flex -space-x-1">
            {PALETTE_CHIPS[id].map((chip) => (
              <span key={chip} className={`h-3.5 w-3.5 rounded-full ring-1 ring-white/30 ${chip}`} />
            ))}
          </span>
        </span>
      ))}
    </div>
  );
};
