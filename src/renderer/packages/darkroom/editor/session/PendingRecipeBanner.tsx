import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { pendingRecipeSignal } from "./pending-recipe-store";

const discardRecipe = (): void => {
  pendingRecipeSignal.value = null;
};

export const PendingRecipeBanner: React.FC = () => {
  const recipe = useSignalValue(pendingRecipeSignal);
  if (!recipe) return null;

  return (
    <div
      role="status"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-md flex items-center gap-3 rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl px-4 py-3 font-editorial"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[var(--s-text)] leading-tight">
          Recipe loaded, add a photo to apply it
        </p>
        <p className="text-[13px] text-[var(--s-text-muted)] leading-snug mt-0.5">
          Look: {recipe.lookName}. It will be applied to the first photo you open.
        </p>
      </div>
      <button
        type="button"
        onClick={discardRecipe}
        aria-label="Discard the shared recipe"
        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
};
