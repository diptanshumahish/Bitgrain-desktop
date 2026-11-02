import { signal } from "@bitgrain/core/signal";
import { STYLE_DEFINITIONS } from "@bitgrain/engine/styles/engine/style-registry";

const THUMB_WIDTH = 280;
const THUMB_SCALE = 0.75;

export const styleThumbsSignal = signal<ReadonlyMap<string, ImageBitmap>>(new Map());

let worker: Worker | null = null;
let requestedSource: string | null = null;
let token = 0;

const thumbWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL("./style-thumbs.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ token: number; styleId: string; thumb: ImageBitmap }>) => {
      if (event.data.token !== token) return;
      const next = new Map(styleThumbsSignal.value);
      next.set(event.data.styleId, event.data.thumb);
      styleThumbsSignal.value = next;
    };
  }
  return worker;
};

const loadBitmap = async (source: string): Promise<ImageBitmap> => {
  const blob = await (await fetch(source)).blob();
  const full = await createImageBitmap(blob);
  const height = Math.max(1, Math.round((full.height / full.width) * THUMB_WIDTH));
  const scaled = await createImageBitmap(full, { resizeWidth: THUMB_WIDTH, resizeHeight: height, resizeQuality: "medium" });
  full.close();
  return scaled;
};

export const requestStyleThumbs = async (source: string, priority: readonly string[]): Promise<void> => {
  if (requestedSource === source) return;
  requestedSource = source;
  token += 1;
  styleThumbsSignal.value = new Map();
  const bitmap = await loadBitmap(source);
  const rest = STYLE_DEFINITIONS.map((definition) => definition.id).filter((id) => !priority.includes(id));
  thumbWorker().postMessage({ token, bitmap, styleIds: [...priority, ...rest], scale: THUMB_SCALE }, [bitmap]);
};
