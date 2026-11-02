import { createRenderQueue } from "./render-queue";

interface CacheEntry {
  promise: Promise<string>;
  url: string | null;
  holders: number;
}

const MAX_IDLE_ENTRIES = 48;
const CANCELLED_MESSAGE = "photo look render no longer needed";
const MAX_CONCURRENT_RENDERS = 2;

const entries = new Map<string, CacheEntry>();
const ownedUrls = new Set<string>();
const renderQueue = createRenderQueue(MAX_CONCURRENT_RENDERS);

const evictIdleEntries = (): void => {
  const idle = [...entries.entries()].filter(([, entry]) => entry.holders === 0 && entry.url !== null);
  const excess = idle.length - MAX_IDLE_ENTRIES;
  for (const [key, entry] of idle.slice(0, Math.max(0, excess))) {
    entries.delete(key);
    if (entry.url && ownedUrls.delete(entry.url)) URL.revokeObjectURL(entry.url);
  }
};

const forgetEntry = (key: string, entry: CacheEntry): void => {
  if (entries.get(key) === entry) entries.delete(key);
};

export const createOwnedObjectUrl = (blob: Blob): string => {
  const url = URL.createObjectURL(blob);
  ownedUrls.add(url);
  return url;
};

export const isCancelledRender = (error: unknown): boolean =>
  error instanceof Error && error.message === CANCELLED_MESSAGE;

export const peekPhotoLook = (key: string): string | null => entries.get(key)?.url ?? null;

export const acquirePhotoLook = (key: string, render: () => Promise<string>): Promise<string> => {
  const existing = entries.get(key);
  if (existing) {
    existing.holders += 1;
    return existing.promise;
  }
  const entry: CacheEntry = { promise: Promise.resolve(""), url: null, holders: 1 };
  const renderWhileHeld = (): Promise<string> => {
    if (entry.holders > 0) return render();
    forgetEntry(key, entry);
    return Promise.reject(new Error(CANCELLED_MESSAGE));
  };
  entry.promise = renderQueue(renderWhileHeld).then((url) => {
    entry.url = url;
    return url;
  });
  entry.promise.catch(() => forgetEntry(key, entry));
  entries.set(key, entry);
  return entry.promise;
};

export const releasePhotoLook = (key: string): void => {
  const entry = entries.get(key);
  if (!entry) return;
  entry.holders = Math.max(0, entry.holders - 1);
  if (entry.holders === 0) evictIdleEntries();
};
