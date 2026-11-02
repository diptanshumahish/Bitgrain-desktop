import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { ExportFormat, ExportScope } from "../../../panels/export-state";
import { exportStudio } from "../../../hooks/useStudioExport";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { ResolvedSelection } from "../selection/selection-layers";
import { buildSelectionSvg, selectionTemplate, shiftedSelectionLayers } from "../selection/render-selection";
import { downloadSvg, exportPagesSvg, notifySvgGaps } from "../document/svg-file-export";
import { toDesignFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import { isSvgFormat } from "./export-format-options";

const TRANSPARENT = "transparent";
const SELECTION_SUFFIX = " selection";

interface ExtendedExportArgs {
  scope: ExportScope;
  format: ExportFormat;
  quality: number;
  scale: number;
  watermark: boolean;
  pages: TemplatePage[];
  fallbackImage: string | null;
  selection: ResolvedSelection | null;
}

export const isExtendedExport = (scope: ExportScope, format: ExportFormat): boolean =>
  scope === "selection" || isSvgFormat(format);

const exportSelection = async (args: ExtendedExportArgs, selection: ResolvedSelection): Promise<void> => {
  const baseName = `${toDesignFileName(studioWorkNameSignal.value)}${SELECTION_SUFFIX}`;
  if (isSvgFormat(args.format)) {
    const result = await buildSelectionSvg(selection, args.watermark, args.scale);
    notifySvgGaps(result.skipped);
    downloadSvg(result.svg, baseName);
    return;
  }
  await exportStudio(
    selectionTemplate(selection), TRANSPARENT, shiftedSelectionLayers(selection), selection.page.image ?? args.fallbackImage,
    Math.max(1, Math.round(selection.bounds.width * args.scale)), Math.max(1, Math.round(selection.bounds.height * args.scale)),
    args.format, args.quality, args.watermark,
  );
};

export const runExtendedExport = async (args: ExtendedExportArgs): Promise<void> => {
  trackEvent("studio", "export_extended", { details: { scope: args.scope, format: args.format, watermark: args.watermark } });
  if (args.scope === "selection" && args.selection) {
    await exportSelection(args, args.selection);
    return;
  }
  await exportPagesSvg(args.pages, { fallbackImage: args.fallbackImage, watermark: args.watermark, scale: args.scale });
};
