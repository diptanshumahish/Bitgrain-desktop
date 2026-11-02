import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { activeSampleLookSignal } from "./sample-look-store";
import { SAMPLE_LOOKS } from "./sample-looks";
import { switchSampleLook } from "./switch-sample-look";

const CHIP_CLASS = "shrink-0 h-8 px-3.5 rounded-full text-[13px] font-medium border transition-colors";
const ACTIVE_CHIP_CLASS = "bg-[var(--s-text)] text-[var(--s-bg-panel)] border-transparent";
const IDLE_CHIP_CLASS =
  "bg-transparent text-[var(--s-text)] border-[var(--s-border)] hover:border-[var(--s-border-strong)] hover:bg-[var(--s-bg-input-hover)]";

export const SampleLookChips: React.FC = () => {
  const activeLook = useSignalValue(activeSampleLookSignal);

  return (
    <div role="group" aria-label="Try a look" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {SAMPLE_LOOKS.map((look) => {
        const isActive = look.id === activeLook;
        return (
          <button
            key={look.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => switchSampleLook(look)}
            className={`${CHIP_CLASS} ${isActive ? ACTIVE_CHIP_CLASS : IDLE_CHIP_CLASS}`}
          >
            {look.label}
          </button>
        );
      })}
    </div>
  );
};
