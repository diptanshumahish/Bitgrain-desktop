import { emitUndoToast } from "@bitgrain/ui/overlays/undo-toast/undo-toast-events";
import type { FitSize } from "@bitgrain/studio-core/templates/canvas-fit/fit-context";

const formatSize = (size: FitSize): string => `${Math.round(size.width)} × ${Math.round(size.height)}`;

export const announceFittedTemplate = (original: FitSize, canvas: FitSize, onUseOriginal: () => void): void => {
  emitUndoToast({
    title: "Fitted to your canvas",
    detail: `Laid out for ${formatSize(canvas)}, designed at ${formatSize(original)}`,
    actionLabel: `Use ${formatSize(original)}`,
    onUndo: onUseOriginal,
    onExpire: () => undefined,
  });
};
