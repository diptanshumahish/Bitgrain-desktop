import type { TemplateDef, TemplatePage } from "../../data/studioTypes";
import { summarizeLayers } from "./studio-layer-summary";
import type { RatingContext } from "./rating-types";

interface StudioRatingSource {
  template: TemplateDef;
  pages: TemplatePage[];
  activePageId: string;
  workId?: string;
}

const sourceRef: { current: StudioRatingSource | null } = { current: null };
const revisionRef: { current: number; pages: TemplatePage[] | null } = { current: 0, pages: null };

export function updateStudioRatingSource(source: StudioRatingSource): void {
  if (revisionRef.pages !== source.pages) {
    revisionRef.current += 1;
    revisionRef.pages = source.pages;
  }
  sourceRef.current = source;
}

export function buildStudioRatingContext(): RatingContext {
  const source = sourceRef.current;
  if (!source) return { signature: "empty", properties: {} };
  const activePage = source.pages.find((page) => page.id === source.activePageId) ?? null;
  const summary = summarizeLayers(activePage?.layers ?? []);
  return {
    signature: `${source.template.id}:${source.activePageId}:${revisionRef.current}`,
    properties: {
      template_id: source.template.id,
      template_category: source.template.category,
      work_id: source.workId ?? null,
      page_count: source.pages.length,
      page_width: activePage?.width ?? null,
      page_height: activePage?.height ?? null,
      layer_count: summary.layerCount,
      layer_types: summary.layerTypes,
      effect_kinds: summary.effectKinds,
    },
  };
}
