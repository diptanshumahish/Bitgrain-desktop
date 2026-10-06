import { signal } from "../../lib/signal";
import type { Plugin, InsertImagePayload } from "./types";

export const PLUGIN_DRAG_MIME = "application/x-imgi-plugin-asset";
export const INSERT_IMAGE_EVENT = "imgi:plugin-insert-image";

export interface FloatingWindowPos {
  x: number;
  y: number;
}

export const pluginsSignal = signal<Plugin[]>([]);
export const pluginsLoadedSignal = signal<boolean>(false);
export const activePluginSlugSignal = signal<string | null>(null);
export const pluginWindowPosSignal = signal<FloatingWindowPos | null>(null);

const DEFAULT_OFFSET_X = 64;
const DEFAULT_OFFSET_Y = 80;

export function setActivePluginSlug(slug: string | null): void {
  if (slug && pluginWindowPosSignal.value === null) {
    pluginWindowPosSignal.value = { x: DEFAULT_OFFSET_X, y: DEFAULT_OFFSET_Y };
  }
  activePluginSlugSignal.value = slug;
}

export function setPluginWindowPos(pos: FloatingWindowPos): void {
  pluginWindowPosSignal.value = pos;
}

export function emitInsertImage(payload: InsertImagePayload): void {
  const event = new CustomEvent<InsertImagePayload>(INSERT_IMAGE_EVENT, {
    detail: payload,
  });
  window.dispatchEvent(event);
}

export function onInsertImage(handler: (payload: InsertImagePayload) => void): () => void {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<InsertImagePayload>;
    handler(ce.detail);
  };
  window.addEventListener(INSERT_IMAGE_EVENT, listener);
  return () => window.removeEventListener(INSERT_IMAGE_EVENT, listener);
}
