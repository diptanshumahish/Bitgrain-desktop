import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { closePalette, paletteActiveIndexSignal, paletteQuerySignal, setPaletteQuery } from "../state/palette-store";
import { usePaletteResults } from "../search/use-palette-results";
import { PaletteResultRow } from "./PaletteResultRow";
import { PaletteEmptyState } from "./PaletteEmptyState";
import { handlePaletteKey } from "./palette-keys";
import { runPaletteEntry } from "./run-palette-entry";

const LISTBOX_ID = "command-palette-results";

const optionIdFor = (index: number): string => `${LISTBOX_ID}-${index}`;

export const CommandPaletteDialog: React.FC = () => {
  const query = useSignalValue(paletteQuerySignal);
  const activeIndex = useSignalValue(paletteActiveIndexSignal);
  const results = usePaletteResults(query);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.querySelector(`#${optionIdFor(activeIndex)}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      data-popover-root
      className={`fixed inset-0 ${MODAL_LAYER} flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 pt-[12vh] font-editorial`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label="Search tools and actions" className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text)]">
        <div className="flex items-center gap-2.5 px-4 border-b border-[var(--s-border)]">
          <Search size={15} strokeWidth={2} className="shrink-0 text-[var(--s-text-subtle)]" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setPaletteQuery(event.target.value)}
            onKeyDown={(event) => handlePaletteKey(event, results)}
            placeholder="Search tools, effects, actions and guides"
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-activedescendant={results.length ? optionIdFor(activeIndex) : undefined}
            className="flex-1 bg-transparent py-3.5 text-[14px] outline-none placeholder:text-[var(--s-text-subtle)]"
          />
        </div>
        {results.length === 0 ? (
          <PaletteEmptyState query={query} />
        ) : (
          <ul ref={listRef} id={LISTBOX_ID} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((entry, index) => (
              <PaletteResultRow
                key={entry.id}
                entry={entry}
                optionId={optionIdFor(index)}
                active={index === activeIndex}
                onRun={runPaletteEntry}
                onHover={() => { paletteActiveIndexSignal.value = index; }}
              />
            ))}
          </ul>
        )}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--s-border)] text-[11px] text-[var(--s-text-subtle)]">
          <span>{query.trim() ? "Best matches" : "Try typing halftone, resize or export"}</span>
          <span className="ml-auto">↑ ↓ to move, ↵ to run, esc to close</span>
        </div>
      </div>
    </div>
  );
};
