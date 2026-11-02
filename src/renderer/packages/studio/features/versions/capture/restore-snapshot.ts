import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { normalizePages } from "@bitgrain/studio-core/io/serialize-pages";
import type { VersionSnapshot } from "../version-types";

const FALLBACK_BACKGROUND = "#ffffff";

interface RestoredState {
  pages: TemplatePage[];
  activePageId: string;
}

export function snapshotToState(snapshot: VersionSnapshot): RestoredState {
  const pages = normalizePages(snapshot.pages, {
    layers: [], background: FALLBACK_BACKGROUND, width: snapshot.canvasW, height: snapshot.canvasH,
  });
  const hasActive = pages.some((page) => page.id === snapshot.activePageId);
  return { pages, activePageId: hasActive ? snapshot.activePageId : pages[0].id };
}
