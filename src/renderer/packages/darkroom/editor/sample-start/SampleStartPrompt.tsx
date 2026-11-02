import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { isSampleSignal } from "../../state/image-store";
import { activePanelSignal, mobileEffectsSheetSignal } from "../../toolbar/panel-state/active-panel-store";
import { SampleUploadButton } from "./SampleUploadButton";
import { SampleLookChips } from "./SampleLookChips";

export const SampleStartPrompt: React.FC = () => {
  const isSample = useSignalValue(isSampleSignal);
  const panelOpen = useSignalValue(activePanelSignal) !== null;
  const effectsOpen = useSignalValue(mobileEffectsSheetSignal);
  if (!isSample) return null;
  const phoneVisibility = panelOpen || effectsOpen ? "hidden md:flex" : "flex";

  return (
    <div className={`${phoneVisibility} absolute inset-x-0 bottom-3 md:bottom-[72px] z-30 justify-center px-3 pointer-events-none`}>
      <section
        aria-label="Sample photo"
        className="pointer-events-auto w-full max-w-[460px] flex flex-col gap-2.5 rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl p-2.5 font-editorial"
      >
        <div className="flex items-center gap-3 pl-1.5">
          <p className="flex-1 min-w-0 text-[13px] leading-snug text-[var(--s-text)]">
            This is a sample. Add your own photo and the look comes with it.
          </p>
          <SampleUploadButton />
        </div>
        <SampleLookChips />
      </section>
    </div>
  );
};
