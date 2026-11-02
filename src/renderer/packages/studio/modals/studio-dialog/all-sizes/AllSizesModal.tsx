import React, { useEffect } from "react";
import { Search } from "lucide-react";
import { StudioDialogShell } from "@bitgrain/ui/dialogs/StudioDialogShell";
import type { DesignFormat } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import { SIZE_GROUPS } from "@bitgrain/studio-core/design-sizes/size-groups";
import { useSignalValue } from "@bitgrain/core/signal";
import { setSizeQuery, sizeQuerySignal } from "./size-query-signal";
import { filterSizeGroups } from "./filter-size-groups";
import { SizeGroupSection } from "./size-group-section";

const SEARCH_ICON_SIZE = 14;

interface AllSizesModalProps {
  onPick: (format: DesignFormat) => void;
  onClose: () => void;
}

export const AllSizesModal: React.FC<AllSizesModalProps> = ({ onPick, onClose }) => {
  const query = useSignalValue(sizeQuerySignal);
  const groups = filterSizeGroups(SIZE_GROUPS, query);

  useEffect(() => () => setSizeQuery(""), []);

  const pick = (format: DesignFormat): void => {
    onClose();
    onPick(format);
  };

  return (
    <StudioDialogShell
      title="All sizes"
      description="Sizes with safe area guides open with red lines that show where platforms crop or cover your design."
      widthClass="max-w-3xl"
      onClose={onClose}
    >
      <label className="mb-5 flex h-9 items-center gap-2 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2.5 focus-within:border-[var(--s-border-focus)]">
        <Search size={SEARCH_ICON_SIZE} className="shrink-0 text-[var(--s-text-muted)]" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setSizeQuery(event.target.value)}
          placeholder="Search sizes, like banner or reel"
          aria-label="Search sizes"
          className="h-full flex-1 bg-transparent text-[13px] text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-subtle)]"
        />
      </label>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <SizeGroupSection key={group.id} group={group} onPick={pick} />
        ))}
        {groups.length === 0 && (
          <p className="py-8 text-center text-[12.5px] text-[var(--s-text-muted)]">No sizes match that search. Try a custom size instead.</p>
        )}
      </div>
    </StudioDialogShell>
  );
};
