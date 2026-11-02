import { imageSignal } from "../../state/image-store";
import { undoHistory } from "../../state/history-store";
import { commitImageBlob } from "../../editor/image-edits/commit-image-edit";
import { emitUndoToast } from "@bitgrain/ui/overlays/undo-toast/undo-toast-events";
import { removeBackgroundFromUrl } from "../remove-background";

const keepCutOut = (): void => undefined;

export const removeDarkroomBackground = async (): Promise<void> => {
  const sourceUrl = imageSignal.value;
  if (!sourceUrl) return;
  const outcome = await removeBackgroundFromUrl(sourceUrl, "darkroom");
  if (!outcome || imageSignal.value !== sourceUrl) return;
  await commitImageBlob(outcome.blob, { width: outcome.width, height: outcome.height });
  emitUndoToast({
    title: "Background removed",
    detail: "Done on your device, nothing was uploaded.",
    onUndo: undoHistory,
    onExpire: keepCutOut,
  });
};
