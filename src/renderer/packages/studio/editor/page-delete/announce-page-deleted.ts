import { trackEvent } from "@bitgrain/platform/tracker";
import { emitUndoToast } from "@bitgrain/ui/overlays/undo-toast/undo-toast-events";

export const announcePageDeleted = (undo: () => void): void => {
  emitUndoToast({
    title: "Page deleted",
    detail: "Changed your mind? You can bring it back.",
    onUndo: () => {
      trackEvent("studio", "page_delete_undone");
      undo();
    },
    onExpire: () => undefined,
  });
};
