import type { MaskLayer } from "../mask/mask-types";
import { loadBrushImage } from "../mask/canvas/brush-image-cache";

const syncedBrushes = new WeakMap<Worker, Map<string, string>>();
const pendingSyncs = new WeakMap<Worker, Promise<void>>();

const brushEntries = (masks: readonly MaskLayer[] | undefined): Array<[string, string]> =>
  (masks ?? []).flatMap((mask) => (mask.area.brush ? [[mask.id, mask.area.brush] as [string, string]] : []));

export const needsBrushSync = (worker: Worker, masks: readonly MaskLayer[] | undefined): boolean => {
  const entries = brushEntries(masks);
  const synced = syncedBrushes.get(worker);
  if (!synced) return entries.length > 0;
  if (synced.size !== entries.length) return true;
  return entries.some(([id, brush]) => synced.get(id) !== brush);
};

const postBrushes = async (worker: Worker, entries: Array<[string, string]>): Promise<void> => {
  const bitmaps = await Promise.all(
    entries.map(async ([id, brush]) => [id, await createImageBitmap(await loadBrushImage(brush))] as const),
  );
  worker.postMessage({ type: "setBrushes", brushes: Object.fromEntries(bitmaps) }, bitmaps.map(([, bitmap]) => bitmap));
  syncedBrushes.set(worker, new Map(entries));
};

export const syncWorkerBrushes = (worker: Worker, masks: readonly MaskLayer[] | undefined): Promise<void> => {
  const pending = pendingSyncs.get(worker);
  if (pending) return pending;
  const request = postBrushes(worker, brushEntries(masks)).finally(() => pendingSyncs.delete(worker));
  pendingSyncs.set(worker, request);
  return request;
};
