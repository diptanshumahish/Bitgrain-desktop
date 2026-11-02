import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";

const STEPS = ["Pick a template", "Type your name", "Swap the photo", "Recolour", "Export"];

export const EditorStepsBar: React.FC = () => {
  const { step } = useSignalValue(editorFrameSignal);

  return (
    <div className="flex h-10 shrink-0 items-center justify-center gap-5 border-t border-white/10 text-[11.5px]">
      {STEPS.map((label, index) => (
        <span
          key={label}
          className={`hidden items-center gap-1.5 transition-colors duration-300 sm:flex ${step === index + 1 ? "text-white" : step > index + 1 ? "text-white/45" : "text-white/25"}`}
        >
          <span className="text-white/40">{index + 1}</span>
          {label}
        </span>
      ))}
    </div>
  );
};
