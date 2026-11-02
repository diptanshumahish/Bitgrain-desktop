import type { ExportScope } from "../../../panels/export-state";

interface DownloadLabelInput {
  printMode: boolean;
  scope: ExportScope;
  pagesAsFormat: boolean;
  pageCount: number;
  formatLabel: string;
  multiModeLabel: string;
}

export const exportDownloadLabel = (input: DownloadLabelInput): string => {
  if (input.printMode) return "Download print PDF";
  if (input.scope === "selection") return `Download selection, ${input.formatLabel}`;
  if (input.scope === "all" && input.pageCount > 1) {
    return input.pagesAsFormat ? `Download ${input.pageCount} pages as ${input.formatLabel}` : `Download ${input.pageCount} pages, ${input.multiModeLabel}`;
  }
  return `Download ${input.formatLabel}`;
};
