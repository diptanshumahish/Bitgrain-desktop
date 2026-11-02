import { emitUndoToast } from "@bitgrain/ui/overlays/undo-toast/undo-toast-events";
import { removeBackgroundFromUrl } from "../remove-background";
import { storeCutOut } from "../storage/store-cut-out";

interface RemoveLayerBackgroundArgs {
  sourceUrl: string;
  originalSrc: string;
  layerName: string;
  applySrc: (src: string) => void;
}

const keepCutOut = (): void => undefined;

export const removeLayerBackground = async ({ sourceUrl, originalSrc, layerName, applySrc }: RemoveLayerBackgroundArgs): Promise<void> => {
  const outcome = await removeBackgroundFromUrl(sourceUrl, "studio");
  if (!outcome) return;
  applySrc(await storeCutOut(outcome.blob, layerName));
  emitUndoToast({
    title: "Background removed",
    detail: "Done on your device, nothing was uploaded.",
    onUndo: () => applySrc(originalSrc),
    onExpire: keepCutOut,
  });
};
