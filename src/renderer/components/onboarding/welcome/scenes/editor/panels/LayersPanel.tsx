import React from "react";
import { Image, Minus, PenTool, Type, type LucideIcon } from "lucide-react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal, type EditorSelection } from "../timeline/editor-frame-store";

interface LayerRow {
  label: string;
  icon: LucideIcon;
  activeFor: EditorSelection[];
}

const LAYER_ROWS: LayerRow[] = [
  { label: "Dates", icon: Type, activeFor: ["palette"] },
  { label: "Rule", icon: Minus, activeFor: [] },
  { label: "Scribble loop", icon: PenTool, activeFor: ["palette"] },
  { label: "Subtitle", icon: Type, activeFor: ["palette"] },
  { label: "Headline", icon: Type, activeFor: ["headline"] },
  { label: "Tour", icon: Type, activeFor: [] },
  { label: "Portrait", icon: Image, activeFor: ["photo"] },
];

export const LayersPanel: React.FC = () => {
  const { loaded, selection } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 px-1 text-[11px] text-white/40">Layers</p>
      {loaded ? (
        LAYER_ROWS.map(({ label, icon: Icon, activeFor }) => (
          <span
            key={label}
            className={`flex items-center gap-2 rounded-md px-2 py-[3px] text-[11px] transition-colors duration-300 ${activeFor.includes(selection) ? "bg-violet-500/25 text-white" : "text-white/55"}`}
          >
            <Icon size={11} strokeWidth={1.75} />
            {label}
          </span>
        ))
      ) : (
        <span className="px-2 py-1 text-[11px] text-white/30">Pick a template to start</span>
      )}
    </div>
  );
};
