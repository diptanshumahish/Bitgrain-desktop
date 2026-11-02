import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";

const FILE_NAME_PATTERN = /\.(png|jpe?g|webp|gif|avif|bmp|heic|heif)$/i;

interface ReplaceDroppedImageArgs {
  layerId: string;
  src: string;
  name?: string;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  setSelectedIds: (ids: string[]) => void;
}

const nextLayerName = (layer: Layer, droppedName?: string): string =>
  droppedName && FILE_NAME_PATTERN.test(layer.name) ? droppedName : layer.name;

const replaceImageSource = (layers: Layer[], layerId: string, src: string, name?: string): Layer[] =>
  updateLayersRecursively(layers, [layerId], (layer) =>
    ({ src, crop: undefined, fit: "cover", name: nextLayerName(layer, name) }) as Partial<Layer>,
  );

export const replaceDroppedImage = ({ layerId, src, name, setLayers, setSelectedIds }: ReplaceDroppedImageArgs): void => {
  setLayers((prev) => replaceImageSource(prev, layerId, src, name));
  setSelectedIds([layerId]);
  trackEvent("studio", "image_replaced", { details: { source: "drop" } });
};
