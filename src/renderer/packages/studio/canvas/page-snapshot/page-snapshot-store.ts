import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { signal } from "@bitgrain/core/signal";
import { renderPageSnapshot } from "./render-page-snapshot";
import { SNAPSHOT_IDLE_TIMEOUT_MS } from "./snapshot-limits";

export interface PageSnapshot {
  page: TemplatePage;
  url: string;
}

export const pageSnapshotsSignal = signal<ReadonlyMap<string, PageSnapshot>>(new Map());

const waiting = new Map<string, TemplatePage>();
const runningRef: { current: boolean } = { current: false };

const waitForIdle = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: SNAPSHOT_IDLE_TIMEOUT_MS });
      return;
    }
    window.setTimeout(resolve, SNAPSHOT_IDLE_TIMEOUT_MS);
  });

const storeSnapshot = (page: TemplatePage, url: string): void => {
  const next = new Map(pageSnapshotsSignal.value);
  const previous = next.get(page.id);
  next.set(page.id, { page, url });
  pageSnapshotsSignal.value = next;
  if (previous) URL.revokeObjectURL(previous.url);
};

const takeNext = (): TemplatePage | null => {
  const first = waiting.entries().next();
  if (first.done) return null;
  waiting.delete(first.value[0]);
  return first.value[1];
};

const renderOne = async (page: TemplatePage): Promise<void> => {
  try {
    storeSnapshot(page, await renderPageSnapshot(page));
  } catch (error) {
    console.error("page snapshot failed:", error);
  }
};

const drainQueue = async (): Promise<void> => {
  runningRef.current = true;
  for (let page = takeNext(); page; page = takeNext()) {
    await waitForIdle();
    await renderOne(page);
  }
  runningRef.current = false;
};

const isSnapshotFresh = (page: TemplatePage): boolean =>
  pageSnapshotsSignal.value.get(page.id)?.page === page;

const canSnapshot = (page: TemplatePage): boolean => !page.background.includes("gradient");

export const requestPageSnapshot = (page: TemplatePage): void => {
  if (!canSnapshot(page) || isSnapshotFresh(page) || waiting.get(page.id) === page) return;
  waiting.set(page.id, page);
  if (!runningRef.current) void drainQueue();
};

export const prunePageSnapshots = (pageIds: ReadonlySet<string>): void => {
  const current = pageSnapshotsSignal.value;
  const stale = [...current.keys()].filter((id) => !pageIds.has(id));
  if (stale.length === 0) return;
  const next = new Map(current);
  stale.forEach((id) => {
    URL.revokeObjectURL(current.get(id)?.url ?? "");
    next.delete(id);
  });
  pageSnapshotsSignal.value = next;
};
