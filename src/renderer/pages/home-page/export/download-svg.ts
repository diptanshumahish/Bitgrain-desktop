import { triggerBlobDownload } from "../../../engine/Exporter";
import { trackEvent as trackPosthog } from "../../../lib/analytics";
import { trackEvent } from "../../../lib/tracker";
import { renderAsciiSvgForExport } from "../../../components/output-preview/export-render";
import { reportProgress, finishProgress, setExportProgress, INDETERMINATE } from "../../../engine/export/export-progress";
import { vectorKindFor, VECTOR_UNAVAILABLE_HINT, type VectorKind } from "../../../engine/export/vector/vector-support";
import { getPlanLimits } from "../../../config/plan-limits";
import { openVectorUpgradePrompt } from "../../../lib/plan-gate/vector-export-gate";
import { emitStatusToast } from "../../../components/portal/status-toast/status-toast-events";
import { lutIdSignal } from "../../../store/transform-store";
import { renderHalftoneSvg } from "./render-halftone-svg";
import { currentExportBaseName } from "./export-filename";
import type { TransformMode, DitherMethod } from "../../../engine/types";

export interface SvgDownloadArgs {
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
  trackPosthog("export_downloaded", {
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

export const triggerSvgDownload = async (args: SvgDownloadArgs): Promise<void> => {
  if (!args.isSample && !getPlanLimits(args.plan).allowSvgExport) {
    openVectorUpgradePrompt("svg_export");
    return;
  }
  const kind = vectorKindFor(args.modes, lutIdSignal.value);
  if (!kind) {
    emitStatusToast({ title: "SVG isn't available for this look", detail: VECTOR_UNAVAILABLE_HINT });
    return;
  }
  reportProgress("rendering", INDETERMINATE);
  try {
    const svg = await renderVector(kind, args.transparent);
    reportProgress("encoding", INDETERMINATE);
    triggerBlobDownload(new Blob([svg], { type: SVG_MIME }), `${currentExportBaseName()}.svg`);
    finishProgress();
    trackSvgExport(args);
  } catch (error) {
    reportSvgFailure(error);
  }
};
