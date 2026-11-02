import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { exportPrintPdf, printPageScale } from "../../hooks/export/print/export-print-pdf";
import type { PrintPdfArgs } from "../../hooks/export/print/export-print-pdf";
import { lockDotSizeSignal, printPaperSignal } from "./print-export-state";

interface PrintExportRequest {
  template: TemplateDef;
  pages: TemplatePage[];
  image: string | null;
  scale: number;
  watermark: boolean;
  maxLongEdge: number | null;
}

interface PrintExportResult {
  requestedLongEdge: number;
  deliveredLongEdge: number;
}

const longEdgeAt = (page: TemplatePage, args: PrintPdfArgs): number =>
  Math.round(Math.max(page.width, page.height) * printPageScale(page, args));

export const runPrintExport = async (request: PrintExportRequest): Promise<PrintExportResult> => {
  const args: PrintPdfArgs = { ...request, paperName: printPaperSignal.value, lockDotSize: lockDotSizeSignal.value };
  await exportPrintPdf(args);
  trackEvent("studio", "export_print_pdf", {
    details: {
      page_count: request.pages.length,
      watermark: request.watermark,
      paper: args.paperName ?? "page",
      lock_dot_size: args.lockDotSize,
    },
  });
  const firstPage = request.pages[0];
  if (!firstPage) return { requestedLongEdge: 0, deliveredLongEdge: 0 };
  return {
    requestedLongEdge: longEdgeAt(firstPage, { ...args, maxLongEdge: null }),
    deliveredLongEdge: longEdgeAt(firstPage, args),
  };
};
