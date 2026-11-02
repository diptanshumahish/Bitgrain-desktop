import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { registerWatermarkedExport, shouldPromptUpgrade } from "@bitgrain/platform/plans/upgrade-prompt";
import { trackEvent } from "@bitgrain/platform/tracker";

interface WatermarkFollowup {
  plan: string;
  format: "mp4" | "webm";
  requestedLongEdge: number;
  deliveredLongEdge: number;
}

export function announceWatermarkedExport(followup: WatermarkFollowup): void {
  trackEvent("video", "watermark_gate_shown", {
    details: { context: "video_export", format: followup.format, plan: followup.plan },
  });
  if (!shouldPromptUpgrade(registerWatermarkedExport())) return;
  emitPlatformModal({
    type: "post-export-upgrade",
    requestedLongEdge: followup.requestedLongEdge,
    deliveredLongEdge: followup.deliveredLongEdge,
  });
}
