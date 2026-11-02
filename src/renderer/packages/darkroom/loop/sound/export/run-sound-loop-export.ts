import { checkSoundLoopExport } from "@bitgrain/platform/plans/gate/pro-features/sound-loop-gate";
import { trackEvent } from "@bitgrain/platform/tracker";
import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { currentExportBaseName } from "../../../editor/export/export-filename";
import { beginLoopExport, endLoopExport, loopExportErrorSignal, loopExportStatusSignal } from "../../export/loop-export-store";
import { exportSoundLoop, type SoundLoopRequest } from "./export-sound-loop";
import { announceSoundExport } from "./sound-export-notices";
import { trackSoundLoopExported } from "./track-sound-loop-export";

const EXPORT_FAILED_MESSAGE = "The sound loop could not be made in this browser. Try a shorter length, or the latest Chrome or Safari.";
const PLAN_UNKNOWN_MESSAGE = "We could not check your plan just now. Please try again in a moment.";
const GATE_TRIGGER = "sound_loop_export";

const isAbort = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

const reportFailure = (error: unknown, request: SoundLoopRequest): void => {
  loopExportErrorSignal.value = EXPORT_FAILED_MESSAGE;
  trackEvent("home", "loop_export_failed", {
    details: { motion: request.motion, sound: true, error_name: error instanceof Error ? error.name : "unknown" },
  });
};

const passesGate = async (): Promise<string | null> => {
  const gate = await checkSoundLoopExport(GATE_TRIGGER);
  if (gate.allowed) return gate.plan;
  if (gate.reason === "unknown") loopExportErrorSignal.value = PLAN_UNKNOWN_MESSAGE;
  return null;
};

export const runSoundLoopExport = async (request: SoundLoopRequest): Promise<boolean> => {
  loopExportErrorSignal.value = null;
  const plan = await passesGate();
  if (!plan) return false;
  const controller = beginLoopExport();
  try {
    const encoded = await exportSoundLoop({
      ...request,
      plan,
      signal: controller.signal,
      onProgress: (phase, ratio) => {
        loopExportStatusSignal.value = { phase, ratio };
      },
    });
    downloadBlob(encoded.blob, `${currentExportBaseName()}-sound-loop.${encoded.extension}`);
    announceSoundExport(request, encoded);
    trackSoundLoopExported(request, encoded);
    return true;
  } catch (error) {
    if (!isAbort(error)) reportFailure(error, request);
    return false;
  } finally {
    endLoopExport();
  }
};
