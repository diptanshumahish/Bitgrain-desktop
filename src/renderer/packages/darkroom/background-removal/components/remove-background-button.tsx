import React from "react";
import { Scissors } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { removalStatusSignal } from "../removal-status-store";

interface RemoveBackgroundButtonProps {
  onClick: () => void;
}

export const RemoveBackgroundButton: React.FC<RemoveBackgroundButtonProps> = ({ onClick }) => {
  const busy = useSignalValue(removalStatusSignal) !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[11.5px] font-semibold text-[var(--s-text)] cursor-pointer transition-colors hover:border-[var(--s-accent)] disabled:opacity-50 disabled:cursor-wait"
    >
      <Scissors size={12} strokeWidth={1.75} />
      {busy ? "Removing background..." : "Remove background"}
    </button>
  );
};
