import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { Work } from "@bitgrain/studio-core/model/work";
import { serializePages } from "@bitgrain/studio-core/io/serialize-pages";

export interface StudioDocumentState {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages: TemplatePage[];
  activePageId: string;
  workName?: string;
}

const UNTITLED_NAME = "Untitled";

function livePages(state: StudioDocumentState): TemplatePage[] {
  return state.pages.map((page) => (page.id === state.activePageId ? { ...page, layers: state.layers } : page));
}

export function buildWorkSnapshot(projectId: string, state: StudioDocumentState): Work {
  const now = Date.now();
  return {
    id: projectId,
    name: state.workName || UNTITLED_NAME,
    thumbnail: null,
    background: state.background,
    canvasW: state.template.width,
    canvasH: state.template.height,
    layers: state.layers,
    pages: serializePages(livePages(state)),
    image: state.image,
    createdAt: now,
    updatedAt: now,
  };
}
