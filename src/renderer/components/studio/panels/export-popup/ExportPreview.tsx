import React, { useEffect, useRef } from "react";
import { signal, useSignalValue } from "../../../../lib/signal";
import type { TemplateDef, TemplatePage } from "../../../../data/studioTypes";
import { describePrintSize, resolvePrintSize } from "../../hooks/export/print/print-geometry";
import { BLEED_MM } from "../../hooks/export/print/print-layout";
import { PrintMarks } from "./PrintMarks";
import { renderExportPreview } from "./render-export-preview";

interface ExportPreviewProps {
  template: TemplateDef;
  page: TemplatePage;
  pageCount: number;
  printMode: boolean;
  outW: number;
  outH: number;
}

const previewUrlSignal = signal<string | null>(null);
const STACKED_SHEET_CLASSES = ["translate-x-3 translate-y-3", "translate-x-1.5 translate-y-1.5"];

const captionFor = (page: TemplatePage, pageCount: number, outW: number, outH: number, printMode: boolean): string => {
  const pages = pageCount > 1 ? `${pageCount} pages, ` : "";
  const physical = printMode ? `${describePrintSize(resolvePrintSize(page.width, page.height))}, ` : "";
  return `${pages}${physical}${outW} × ${outH} px`;
};

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  template,
  page,
  pageCount,
  printMode,
  outW,
  outH,
}) => {
  const previewUrl = useSignalValue(previewUrlSignal);
  const renderToken = useRef(0);

  useEffect(() => {
    const token = ++renderToken.current;
    previewUrlSignal.value = null;
    const render = async (): Promise<void> => {
      const url = await renderExportPreview(template, page);
      if (token === renderToken.current) previewUrlSignal.value = url;
    };
    void render();
  }, [template, page]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative flex flex-1 items-center justify-center min-h-[240px] p-10 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-canvas)] bg-[radial-gradient(var(--s-border)_1px,transparent_1px)] bg-[size:14px_14px] overflow-hidden">
        {previewUrl ? (
          <div className="relative">
            {pageCount > 1 &&
              STACKED_SHEET_CLASSES.map((offset) => (
                <span
                  key={offset}
                  className={`absolute inset-0 border border-neutral-300 bg-neutral-200 shadow-sm ${offset}`}
                />
              ))}
            <img
              src={previewUrl}
              alt={`Preview of ${page.name}`}
              className="relative block max-h-[300px] max-w-full w-auto h-auto shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
            />
            {printMode && <PrintMarks />}
          </div>
        ) : (
          <div className="w-40 h-52 rounded-sm bg-[var(--s-bg-input)] animate-pulse" />
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[11px] text-[var(--s-text-muted)]">{captionFor(page, pageCount, outW, outH, printMode)}</span>
        {printMode && (
          <span className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">
            Red is the {BLEED_MM}mm bleed, blue is the safe zone, keep text inside it.
          </span>
        )}
      </div>
    </div>
  );
};
