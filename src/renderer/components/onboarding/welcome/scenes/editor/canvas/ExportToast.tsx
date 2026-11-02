import React from "react";
import { Check } from "lucide-react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";

export const ExportToast: React.FC = () => {
  const { exported } = useSignalValue(editorFrameSignal);

  return (
    <div className={`pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transition-all duration-500 ${exported ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      <div className="flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[12px] font-medium text-black shadow-xl">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={14} strokeWidth={3} />
        </span>
        night-songs-poster.png saved, 2480 × 3508
      </div>
    </div>
  );
};
