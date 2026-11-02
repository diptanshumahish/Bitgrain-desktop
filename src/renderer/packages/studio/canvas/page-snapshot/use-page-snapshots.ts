import { useEffect } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import {
  pageSnapshotsSignal,
  prunePageSnapshots,
  requestPageSnapshot,
  type PageSnapshot,
} from "./page-snapshot-store";
import { SNAPSHOT_PREFETCH_ZOOM } from "./snapshot-limits";

interface PageSnapshotInput {
  pages: TemplatePage[];
  zoom: number;
  livePageIds: ReadonlySet<string>;
  activePageId: string;
}

export const usePageSnapshots = ({
  pages, zoom, livePageIds, activePageId,
}: PageSnapshotInput): ReadonlyMap<string, PageSnapshot> => {
  const snapshots = useSignalValue(pageSnapshotsSignal);

  useEffect(() => {
    prunePageSnapshots(new Set(pages.map((page) => page.id)));
  }, [pages]);

  useEffect(() => {
    if (zoom >= SNAPSHOT_PREFETCH_ZOOM) return;
    pages
      .filter((page) => page.id !== activePageId && livePageIds.has(page.id))
      .forEach(requestPageSnapshot);
  }, [pages, zoom, livePageIds, activePageId]);

  return snapshots;
};

export const snapshotUrlFor = (
  snapshots: ReadonlyMap<string, PageSnapshot>,
  page: TemplatePage,
): string | null => {
  const snapshot = snapshots.get(page.id);
  return snapshot && snapshot.page === page ? snapshot.url : null;
};
