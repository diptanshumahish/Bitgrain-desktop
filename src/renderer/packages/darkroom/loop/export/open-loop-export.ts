import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { stopLoopPreview } from "../preview/loop-preview-store";

export const openLoopExport = (source: string): void => {
  stopLoopPreview();
  trackEvent("home", "modal_opened", { details: { modal: "loop-export", source } });
  emitDarkroomModal({ type: "loop-export" });
};
