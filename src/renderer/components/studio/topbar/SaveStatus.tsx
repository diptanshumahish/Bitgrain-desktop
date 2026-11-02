import React from "react";
import { Check, CloudOff, Loader2, type LucideIcon } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { saveStatusSignal, type SaveStatus as SaveStatusValue } from "../../../store/studio-save-status";

const ICON_SIZE = 11;

interface StatusCopy {
  icon: LucideIcon;
  label: string;
  spin: boolean;
}

const STATUS_COPY: Record<Exclude<SaveStatusValue, "idle">, StatusCopy> = {
  saving: { icon: Loader2, label: "Saving changes", spin: true },
  saved: { icon: Check, label: "All changes saved", spin: false },
  retrying: { icon: CloudOff, label: "Saved on this device, retrying", spin: false },
};

export const SaveStatus: React.FC = () => {
  const status = useSignalValue(saveStatusSignal);
  if (status === "idle") return null;
  const { icon: Icon, label, spin } = STATUS_COPY[status];

  return (
    <span
      role="status"
      className="flex items-center gap-1.5 text-[11px] text-[var(--s-text-muted)] whitespace-nowrap select-none"
    >
      <Icon size={ICON_SIZE} strokeWidth={2} className={spin ? "animate-spin" : undefined} />
      {label}
    </span>
  );
};
