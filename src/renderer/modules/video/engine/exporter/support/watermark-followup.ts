import { emitModal } from "../../../../../lib/event-bus";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../../../../../utils/upgrade-prompt";
import { trackEvent } from "../../../../../lib/tracker";

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
  emitModal({
    type: "post-export-upgrade",
    requestedLongEdge: followup.requestedLongEdge,
    deliveredLongEdge: followup.deliveredLongEdge,
  });
}
