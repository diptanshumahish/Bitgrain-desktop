import type { Layer } from "../../model/studio-types";
import { buildInstance } from "../core/build-instance";
import { makeInstanceId } from "../core/instance-ids";
import { createMainResolver } from "../core/resolve-mains";
import type { LayerPageLike } from "../tree/layer-walk";
import { omitLayerKeys } from "../tree/layer-keys";
import type { PagesOpResult } from "./pages-op-result";

interface InstancePoint {
  x: number;
  y: number;
}

const HALF = 2;

export const makeInstanceLayer = (pages: LayerPageLike[], componentId: string, center: InstancePoint): Layer | null => {
  const main = createMainResolver(pages).resolve(componentId);
  if (!main) return null;
  const meta = { componentId };
  const seed = {
    ...omitLayerKeys(main, ["component", "anim", "animTracks"]),
    id: makeInstanceId(),
    x: center.x - main.width / HALF,
    y: center.y - main.height / HALF,
    locked: false,
    visible: true,
    layers: [],
    instance: meta,
  } as unknown as Layer;
  return buildInstance(seed, meta, main, false);
};

export const insertInstance = <P extends LayerPageLike>(
  pages: P[],
  componentId: string,
  pageId: string,
  center: InstancePoint,
): PagesOpResult<P> | null => {
  const instance = makeInstanceLayer(pages, componentId, center);
  if (!instance) return null;
  const nextPages = pages.map((page) => (page.id === pageId ? { ...page, layers: [...page.layers, instance] } : page));
  return { pages: nextPages, layerId: instance.id };
};
