import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";

export const notifyUnreadableImage = (fileName: string): void => {
  emitStatusToast({
    title: "Couldn't open that image",
    detail: `${fileName || "This file"} isn't an image we can read. Try a PNG, JPG, WEBP, GIF or SVG.`,
  });
};
