import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { trackEvent as trackPosthog } from "@bitgrain/platform/analytics";
import { trackEvent } from "@bitgrain/platform/tracker";
import { renderAsciiSvgForExport } from "../../preview/export-render";
import { reportProgress, finishProgress, setExportProgress, INDETERMINATE } from "@bitgrain/engine/export/export-progress";
import { vectorKindFor, VECTOR_UNAVAILABLE_HINT, type VectorKind } from "@bitgrain/engine/export/vector/vector-support";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { openVectorUpgradePrompt } from "@bitgrain/platform/plans/gate/vector-export-gate";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { lutIdSignal } from "../../state/transform-store";
import { renderHalftoneSvg } from "./render-halftone-svg";
import { currentExportBaseName } from "./export-filename";
import type { TransformMode, DitherMethod } from "@bitgrain/engine/core/types";

interface SvgDownloadArgs {
  transparent: boolean;
  bgColor: string;
  isSample: boolean;
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  plan: string;
}

const SVG_MIME = "image/svg+xml";

const renderVector = (kind: VectorKind, transparent: boolean): Promise<string> =>
  kind === "ascii" ? renderAsciiSvgForExport(transparent) : renderHalftoneSvg(transparent);

const trackSvgExport = ({ transparent, isSample, modes, ditherMethod }: SvgDownloadArgs): void => {
  trackPosthog("home:export_downloaded", {
    format: "svg",
    transform_modes: modes,
    is_sample: isSample,
    transparent,
    dither_method: ditherMethod,
  });
  trackEvent("home", "export_svg", { details: { is_sample: isSample, transparent } });
};

const reportSvgFailure = (error: unknown): void => {
  setExportProgress(null);
  trackEvent("home", "export_svg_error", { details: { message: error instanceof Error ? error.message : "unknown" } });
  emitStatusToast({ title: "That SVG didn't come out", detail: "Try again, or export a PNG instead." });
};

export const triggerSvgDownload = async (args: SvgDownloadArgs): Promise<boolean> => {
  if (!args.isSample && !getPlanLimits(args.plan).allowSvgExport) {
    openVectorUpgradePrompt("svg_export");
    return false;
  }
  const kind = vectorKindFor(args.modes, lutIdSignal.value);
  if (!kind) {
    emitStatusToast({ title: "SVG isn't available for this look", detail: VECTOR_UNAVAILABLE_HINT });
    return false;
  }
  reportProgress("rendering", INDETERMINATE);
  try {
    const svg = await renderVector(kind, args.transparent);
    reportProgress("encoding", INDETERMINATE);
    downloadBlob(new Blob([svg], { type: SVG_MIME }), `${currentExportBaseName()}.svg`);
    finishProgress();
    trackSvgExport(args);
    return true;
  } catch (error) {
    reportSvgFailure(error);
    return false;
  }
};
