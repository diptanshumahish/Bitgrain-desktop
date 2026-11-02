import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { saveStatusSignal, type SaveStatus } from "../../../state/studio-save-status";
import { useIsGuest } from "@bitgrain/platform/guest-mode/use-is-guest";

interface SaveStateCopy {
  label: string;
  dotClass: string;
}

const GUEST_STATE_COPY: SaveStateCopy = { label: "Not saved", dotClass: "bg-amber-500" };

const SAVE_STATE_COPY: Record<Exclude<SaveStatus, "idle">, SaveStateCopy> = {
  saving: { label: "Saving", dotClass: "bg-[var(--s-text-muted)] animate-pulse" },
  syncing: { label: "Saved on this device, syncing", dotClass: "bg-[var(--s-text-muted)] animate-pulse" },
  saved: { label: "Saved", dotClass: "bg-[var(--s-text)]" },
  retrying: { label: "Saved on this device", dotClass: "bg-amber-500" },
  needs_pro: { label: "Saved on this device", dotClass: "bg-[var(--s-text-muted)]" },
};

const resolveSaveStateCopy = (guest: boolean, status: SaveStatus): SaveStateCopy | null => {
  if (guest) return GUEST_STATE_COPY;
  if (status === "idle") return null;
  return SAVE_STATE_COPY[status];
};

export const MobileSaveState: React.FC = () => {
  const status = useSignalValue(saveStatusSignal);
  const copy = resolveSaveStateCopy(useIsGuest(), status);
  if (!copy) return null;
  const { label, dotClass } = copy;

  return (
    <span role="status" className="flex items-center gap-1.5 min-w-0 text-[12px] leading-none text-[var(--s-text-muted)]">
      <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${dotClass}`} />
      <span className="truncate">{label}</span>
    </span>
  );
};
