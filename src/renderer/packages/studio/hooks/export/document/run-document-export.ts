import type { ExportFormat } from "../../../panels/export-state";
import { PPTX_EXPORT_FORMAT } from "../../../panels/export-state";
import { resolvePagesInstances } from "@bitgrain/studio-core/components/core/resolve-pages";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { DocumentExportArgs } from "./document-export-types";
import { exportDocumentPdf } from "./export-document-pdf";
import { exportDocumentPptx } from "./export-document-pptx";

export const runDocumentExport = async (format: ExportFormat, args: DocumentExportArgs): Promise<void> => {
  const resolved: DocumentExportArgs = { ...args, pages: resolvePagesInstances(args.pages) };
  const isPptx = format === PPTX_EXPORT_FORMAT;
  if (isPptx) await exportDocumentPptx(resolved);
  else await exportDocumentPdf(resolved);
  trackEvent("studio", isPptx ? "export_pptx" : "export_pdf", {
    details: { page_count: resolved.pages.length, watermark: args.watermark },
  });
};
