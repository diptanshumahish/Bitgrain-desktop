import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { renderStudioToDataUrl } from "../../../hooks/useStudioExport";
import { serializePages } from "@bitgrain/studio-core/io/serialize-pages";
import type { NewVersionInput, VersionSnapshot } from "../version-types";

const THUMB_WIDTH = 240;

export interface VersionSource {
  template: TemplateDef;
  pages: TemplatePage[];
  activePageId: string;
  canvasW: number;
  canvasH: number;
}

const captureSnapshot = (source: VersionSource): VersionSnapshot => ({
  pages: serializePages(source.pages),
  activePageId: source.activePageId,
  canvasW: source.canvasW,
  canvasH: source.canvasH,
});

const renderCoverThumbnail = async (source: VersionSource): Promise<string | null> => {
  const cover = source.pages[0];
  if (!cover) return null;
  const coverTemplate = { ...source.template, width: cover.width, height: cover.height };
  const thumbHeight = Math.max(1, Math.round((THUMB_WIDTH * cover.height) / cover.width));
  try {
    return await renderStudioToDataUrl(coverTemplate, cover.background, cover.layers, cover.image ?? null, THUMB_WIDTH, thumbHeight);
  } catch {
    return null;
  }
};

export async function buildVersionInput(
  projectKey: string, source: VersionSource, name: string, auto: boolean,
): Promise<NewVersionInput> {
  return {
    projectKey,
    name,
    auto,
    snapshot: captureSnapshot(source),
    thumbnail: await renderCoverThumbnail(source),
  };
}
