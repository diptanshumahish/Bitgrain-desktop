import React from "react";
import { useSignalValue } from "../../../lib/signal";
import { modesSignal, paletteSignal, lutIdSignal, printFinishSignal } from "../../../store/transform-store";
import { openEffectsPicker } from "../panel-state/active-panel-store";
import { buildAppliedItems } from "./applied-items";
import { AppliedChip } from "./AppliedChip";

const BAR_CLASS =
  "hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 z-30 max-w-[min(640px,calc(100%-480px))] items-center gap-1.5 flex-wrap justify-center font-editorial";

export const AppliedLooksBar: React.FC = () => {
  const modes = useSignalValue(modesSignal);
  const palette = useSignalValue(paletteSignal);
  const lutId = useSignalValue(lutIdSignal);
  const printFinish = useSignalValue(printFinishSignal);
  const items = buildAppliedItems({ modes, paletteName: palette?.name ?? null, lutId, printFinish });

  if (items.length === 0) {
    return (
      <div className={BAR_CLASS}>
        <button
          type="button"
          onClick={openEffectsPicker}
          className="h-8 px-3.5 rounded-full text-[13px] font-medium bg-[var(--s-bg-panel)]/90 backdrop-blur-xl border border-[var(--s-border)] text-[var(--s-text)] hover:border-[var(--s-accent)] transition-colors"
        >
          Original photo, pick a look
        </button>
      </div>
    );
  }

  return (
    <div className={BAR_CLASS} aria-label="Applied to this photo">
      <span className="text-[13px] text-[var(--s-text-subtle)] mr-0.5">Applied</span>
      {items.map((item) => (
        <AppliedChip key={item.key} label={item.label} onRemove={item.remove} />
      ))}
    </div>
  );
};
