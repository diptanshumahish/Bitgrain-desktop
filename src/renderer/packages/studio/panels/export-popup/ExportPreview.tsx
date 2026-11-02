import React, { useEffect, useRef } from "react";
import { signal, useSignalValue } from "@bitgrain/core/signal";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { describePrintSize } from "@bitgrain/studio-core/render/print/print-geometry";
import { BLEED_MM } from "@bitgrain/studio-core/render/print/print-layout";
import { printEnlargement, resolveTargetPrintSize } from "@bitgrain/studio-core/render/print/paper-target";
import { printPaperSignal } from "../print-export/print-export-state";
import { clampDimsToLongEdge } from "../export-clamp";
import { PrintMarks } from "./PrintMarks";
import { renderExportPreview } from "./render-export-preview";

interface ExportPreviewProps {
  template: TemplateDef;
  page: TemplatePage;
  pageCount: number;
  printMode: boolean;
  outW: number;
  outH: number;
  maxLongEdge: number | null;
}

interface CaptionInput {
  page: TemplatePage;
  pageCount: number;
  outW: number;
  outH: number;
  printMode: boolean;
  paperName: string | null;
  maxLongEdge: number | null;
}

const previewUrlSignal = signal<string | null>(null);
const STACKED_SHEET_CLASSES = ["translate-x-3 translate-y-3", "translate-x-1.5 translate-y-1.5"];

const deliveredPixels = (input: CaptionInput): [number, number] => {
  const enlargement = input.printMode ? printEnlargement(input.page.width, input.page.height, input.paperName) : 1;
  const [width, height] = clampDimsToLongEdge(input.outW * enlargement, input.outH * enlargement, input.maxLongEdge);
  return [Math.round(width), Math.round(height)];
};

const physicalLabel = (input: CaptionInput): string => {
  if (!input.printMode) return "";
  return `${describePrintSize(resolveTargetPrintSize(input.page.width, input.page.height, input.paperName))}, `;
};

const captionFor = (input: CaptionInput): string => {
  const pages = input.pageCount > 1 ? `${input.pageCount} pages, ` : "";
  const [width, height] = deliveredPixels(input);
  return `${pages}${physicalLabel(input)}${width} × ${height} px`;
};

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  template,
  page,
  pageCount,
  printMode,
  outW,
  outH,
  maxLongEdge,
}) => {
  const previewUrl = useSignalValue(previewUrlSignal);
  const paperName = useSignalValue(printPaperSignal);
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
                  className={`absolute inset-0 border border-neutral-300 bg-neutral-200 ${offset}`}
                />
              ))}
            <img
              src={previewUrl}
              alt={`Preview of ${page.name}`}
              className="relative block max-h-[300px] max-w-full w-auto h-auto "
            />
            {printMode && <PrintMarks />}
          </div>
        ) : (
          <div className="w-40 h-52 rounded-sm bg-[var(--s-bg-input)] animate-pulse" />
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[12px] text-[var(--s-text-muted)]">{captionFor({ page, pageCount, outW, outH, printMode, paperName, maxLongEdge })}</span>
        {printMode && (
          <span className="text-[12px] leading-snug text-[var(--s-text-subtle)]">
            Red is the {BLEED_MM}mm bleed, blue is the safe zone, keep text inside it.
          </span>
        )}
      </div>
    </div>
  );
};
