import React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { InspectorSection } from "./InspectorSection";
import { PhotoInspector } from "./PhotoInspector";
import { PaletteSwatches } from "./PaletteSwatches";

const ROW_CLASS = "flex items-center justify-between text-[11.5px]";
const ALIGN_ICONS = [AlignLeft, AlignCenter, AlignRight];

export const InspectorPanel: React.FC = () => {
  const { selection } = useSignalValue(editorFrameSignal);

  return (
    <aside className="no-scrollbar hidden w-56 shrink-0 flex-col gap-0.5 overflow-y-auto border-l border-white/10 p-2 text-left lg:flex">
      <InspectorSection title="Text" active={selection === "headline"}>
        <p className={ROW_CLASS}><span className="text-white/50">Font</span><span className="text-white">Instrument Serif</span></p>
        <p className={ROW_CLASS}><span className="text-white/50">Size</span><span className="text-white">300</span></p>
        <span className="flex gap-1">
          {ALIGN_ICONS.map((Icon, index) => (
            <span key={index} className={`flex h-6 flex-1 items-center justify-center rounded ${index === 0 ? "bg-white/10 text-white" : "text-white/40"}`}>
              <Icon size={12} />
            </span>
          ))}
        </span>
      </InspectorSection>
      <InspectorSection title="Photo" active={selection === "photo"}>
        <PhotoInspector />
      </InspectorSection>
      <InspectorSection title="Palette" active={selection === "palette"}>
        <PaletteSwatches />
      </InspectorSection>
    </aside>
  );
};
