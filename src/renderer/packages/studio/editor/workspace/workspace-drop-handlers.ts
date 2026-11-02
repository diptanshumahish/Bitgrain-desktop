import type React from "react";
import { PLUGIN_DRAG_MIME, emitInsertImage } from "../../plugins/host";
import { dataTransferMayHaveImage, ingestDataTransferImages } from "../studio-image-intake";
import { trackEvent } from "@bitgrain/platform/tracker";

interface PluginDragPayload {
  src: string;
  name?: string;
  width?: number | null;
  height?: number | null;
}

const insertPluginAsset = (raw: string): void => {
  try {
    const data = JSON.parse(raw) as PluginDragPayload;
    trackEvent("studio", "plugin_asset_inserted", { details: { method: "drag" } });
    emitInsertImage({
      src: data.src,
      name: data.name ?? "Image",
      width: data.width ?? undefined,
      height: data.height ?? undefined,
    });
  } catch (error) {
    console.warn("ignored malformed plugin drag payload", error);
  }
};

export const handleWorkspaceDragOver = (event: React.DragEvent): void => {
  if (!event.dataTransfer.types.includes(PLUGIN_DRAG_MIME) && !dataTransferMayHaveImage(event.dataTransfer)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
};

export const handleWorkspaceDrop = (event: React.DragEvent): void => {
  const raw = event.dataTransfer.getData(PLUGIN_DRAG_MIME);
  if (raw) {
    event.preventDefault();
    insertPluginAsset(raw);
    return;
  }
  if (!dataTransferMayHaveImage(event.dataTransfer)) return;
  event.preventDefault();
  ingestDataTransferImages(event.dataTransfer);
};
