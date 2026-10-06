import React from "react";
import { Check, Loader2 } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { saveStatusSignal } from "../../../store/studio-save-status";

export const SaveStatus: React.FC = () => {
  const status = useSignalValue(saveStatusSignal);
  if (status === "idle") return null;

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--s-text-muted)] whitespace-nowrap select-none">
      {status === "saving" ? (
        <>
          <Loader2 size={11} strokeWidth={2} className="animate-spin" />
          saving changes
        </>
      ) : (
        <>
          <Check size={11} strokeWidth={2} />
          all changes saved
        </>
      )}
    </span>
  );
};
