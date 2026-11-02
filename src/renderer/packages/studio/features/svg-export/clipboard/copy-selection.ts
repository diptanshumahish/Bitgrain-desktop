import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { currentPlanId, isPlanKnown } from "@bitgrain/platform/plans/gate/plan-status";
import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";
import { trackEvent } from "@bitgrain/platform/tracker";
import { resolveCurrentSelection, type ResolvedSelection } from "../selection/selection-layers";
import { buildSelectionSvg, renderSelectionCanvas } from "../selection/render-selection";
import { notifySvgGaps } from "../document/svg-file-export";
import { requireAccountToExport } from "@bitgrain/platform/guest-mode/require-account-to-export";
import { allowVectorExportOrPrompt } from "@bitgrain/platform/plans/gate/vector-export-gate";

const PNG_MIME = "image/png";
const TEXT_MIME = "text/plain";
const COPY_SCALE = 2;

type CopyFormat = "png" | "svg";

const COPIED_TOAST: Record<CopyFormat, { title: string; detail: string }> = {
  png: { title: "Copied as PNG", detail: "Paste it into any app that takes images." },
  svg: { title: "Copied as SVG", detail: "Paste the markup into Figma, Illustrator or your code." },
};

const shouldWatermark = (): boolean => getPlanLimits(currentPlanId()).watermark;

const canvasToPng = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))), PNG_MIME);
  });

const pngBlob = async (selection: ResolvedSelection): Promise<Blob> => {
  const canvas = await renderSelectionCanvas(selection, COPY_SCALE);
  if (shouldWatermark()) await applyPngWatermark(canvas);
  return canvasToPng(canvas);
};

const svgBlob = async (selection: ResolvedSelection): Promise<Blob> => {
  const result = await buildSelectionSvg(selection, shouldWatermark(), 1);
  notifySvgGaps(result.skipped);
  return new Blob([result.svg], { type: TEXT_MIME });
};

const writeClipboard = async (mime: string, blob: Promise<Blob>): Promise<void> => {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]);
    return;
  }
  await navigator.clipboard.writeText(await (await blob).text());
};

const notifyNothingSelected = (): void => {
  emitStatusToast({ title: "Nothing to copy", detail: "Select a layer first, then copy it as PNG or SVG." });
};

export const copySelectionAs = async (format: CopyFormat, ids?: string[]): Promise<void> => {
  if (!requireAccountToExport()) return;
  if (format === "svg" && isPlanKnown() && !allowVectorExportOrPrompt(currentPlanId(), "studio_copy_as_svg")) return;
  const selection = resolveCurrentSelection(ids);
  if (!selection) {
    notifyNothingSelected();
    return;
  }
  const blob = format === "png" ? pngBlob(selection) : svgBlob(selection);
  try {
    await writeClipboard(format === "png" ? PNG_MIME : TEXT_MIME, blob);
    trackEvent("studio", "copy_as", { details: { format, count: selection.layers.length } });
    emitStatusToast(COPIED_TOAST[format]);
  } catch {
    emitStatusToast({ title: "Copy did not go through", detail: "Your browser blocked the clipboard. Try again, or export the selection instead." });
  }
};
