import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { lutIdSignal, paletteSignal } from "../../../state/transform-store";
import { pushHistory } from "../../../state/history-store";
import { getLUT } from "@bitgrain/engine/color/luts";
import type { ToolbarState } from "../../use-toolbar-state";

interface ActiveColourNotesProps {
  state: ToolbarState;
}

interface NoteChipProps {
  label: string;
  onRemove: () => void;
}

const NoteChip: React.FC<NoteChipProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md border border-[var(--s-border)] text-[12px] text-[var(--s-text-muted)]">
    {label}
    <button type="button" aria-label={`Remove ${label}`} onClick={onRemove}
      className="w-4 h-4 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:text-[var(--s-text)]">
      <X size={10} />
    </button>
  </span>
);

const removePalette = (): void => {
  paletteSignal.value = null;
  pushHistory();
};

export const ActiveColourNotes: React.FC<ActiveColourNotesProps> = ({ state }) => {
  const palette = useSignalValue(paletteSignal);
  const lutId = useSignalValue(lutIdSignal);
  const lutName = lutId ? getLUT(lutId)?.name ?? "Film grade" : null;
  if (!palette && !lutName) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 px-1">
      <span className="text-[12px] text-[var(--s-text-subtle)] mr-0.5">Also on</span>
      {palette && <NoteChip label={`${palette.name} palette`} onRemove={removePalette} />}
      {lutName && <NoteChip label={lutName} onRemove={() => state.handleSelectLUT(null)} />}
    </div>
  );
};
