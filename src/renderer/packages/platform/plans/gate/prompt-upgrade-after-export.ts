import { emitPlatformModal } from "../../modals/platform-modal-events";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../upgrade-prompt";

const POST_EXPORT_PROMPT_DELAY_MS = 700;

export const promptUpgradeAfterExport = (requested: number, delivered: number, watermarked: boolean): void => {
  if (!watermarked) return;
  if (!shouldPromptUpgrade(registerWatermarkedExport())) return;
  setTimeout(() => {
    emitPlatformModal({
      type: "post-export-upgrade",
      requestedLongEdge: requested,
      deliveredLongEdge: delivered,
    });
  }, POST_EXPORT_PROMPT_DELAY_MS);
};
