import React, { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { runPreflight } from "@bitgrain/studio-core/render/print/preflight/run-preflight";
import { preflightSignal, printModeSignal, printPaperSignal } from "./print-export-state";
import { PreflightList } from "./PreflightList";
import { PrintPaperOptions } from "./PrintPaperOptions";

interface PrintExportSectionProps {
  pages: TemplatePage[];
  fallbackImage: string | null;
}

export const PrintExportSection: React.FC<PrintExportSectionProps> = ({ pages, fallbackImage }) => {
  const enabled = useSignalValue(printModeSignal);
  const items = useSignalValue(preflightSignal);
  const paperName = useSignalValue(printPaperSignal);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    preflightSignal.value = null;
    const check = async (): Promise<void> => {
      const result = await runPreflight({ pages, fallbackImage, paperName });
      if (!cancelled) preflightSignal.value = result;
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [enabled, pages, fallbackImage, paperName]);

  if (!enabled || pages.length === 0) return null;

  return (
    <>
      <PrintPaperOptions page={pages[0]} />
      <div className="flex flex-col gap-2 px-3 py-2.5 rounded-xl bg-[var(--s-bg-input)]">
        <span className="text-[12px] font-medium text-[var(--s-text)]">Preflight</span>
        <PreflightList items={items} />
      </div>
    </>
  );
};
