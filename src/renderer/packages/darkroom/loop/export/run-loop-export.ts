import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { trackEvent } from "@bitgrain/platform/tracker";
import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { MP4_FALLBACK_TOAST } from "../../notices/mp4-fallback-toast";
import { currentExportBaseName } from "../../editor/export/export-filename";
import type { LoopMotion, LoopSettings } from "../loop-settings";
import { exportLoop } from "./export-loop";
import { beginLoopExport, endLoopExport, loopExportErrorSignal, loopExportStatusSignal } from "./loop-export-store";
import { trackLoopExported } from "./track-loop-export";

const EXPORT_FAILED_MESSAGE = "The loop could not be made in this browser. Try a shorter loop, or the latest Chrome or Safari.";

const isAbort = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

const reportFailure = (error: unknown, motion: LoopMotion): void => {
  loopExportErrorSignal.value = EXPORT_FAILED_MESSAGE;
  trackEvent("home", "loop_export_failed", {
    details: { motion, error_name: error instanceof Error ? error.name : "unknown" },
  });
};

export const runLoopExport = async (settings: LoopSettings, motion: LoopMotion): Promise<boolean> => {
  const grant = await resolveExportPlan();
  if (!grant) return false;
  const controller = beginLoopExport();
  try {
    const encoded = await exportLoop({
      settings,
      motion,
      plan: grant.plan,
      signal: controller.signal,
      onProgress: (phase, ratio) => {
        loopExportStatusSignal.value = { phase, ratio };
      },
    });
    downloadBlob(encoded.blob, `${currentExportBaseName()}-loop.${encoded.extension}`);
    if (settings.format === "mp4" && encoded.extension !== "mp4") emitStatusToast(MP4_FALLBACK_TOAST);
    trackLoopExported(settings, motion, encoded.extension);
    await settleExportPack(grant, "done");
    return true;
  } catch (error) {
    if (!isAbort(error)) reportFailure(error, motion);
    await settleExportPack(grant, isAbort(error) ? "cancelled" : "failed");
    return false;
  } finally {
    endLoopExport();
  }
};
