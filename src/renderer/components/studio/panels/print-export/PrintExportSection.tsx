import React, { useEffect } from "react";
import { useSignalValue } from "../../../../lib/signal";
import type { TemplatePage } from "../../../../data/studioTypes";
import { runPreflight } from "../../hooks/export/print/preflight/run-preflight";
import { preflightSignal, printModeSignal } from "./print-export-state";
import { PreflightList } from "./PreflightList";

interface PrintExportSectionProps {
  pages: TemplatePage[];
  fallbackImage: string | null;
}

export const PrintExportSection: React.FC<PrintExportSectionProps> = ({ pages, fallbackImage }) => {
  const enabled = useSignalValue(printModeSignal);
  const items = useSignalValue(preflightSignal);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    preflightSignal.value = null;
    const check = async (): Promise<void> => {
      const result = await runPreflight({ pages, fallbackImage });
      if (!cancelled) preflightSignal.value = result;
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [enabled, pages, fallbackImage]);

  if (!enabled || pages.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-3 py-2.5 rounded-xl bg-[var(--s-bg-input)]">
      <span className="text-[11px] font-medium text-[var(--s-text)]">Preflight</span>
      <PreflightList items={items} />
    </div>
  );
};
