import { useCallback, useEffect } from "react";
import { saveWork, stageWorkLocally } from "@bitgrain/platform/projects/works-store";
import type { Work } from "@bitgrain/studio-core/model/work";
import { renderStudioToDataUrl } from "../hooks/useStudioExport";
import { trackEvent } from "@bitgrain/platform/tracker";
import { currentEditGeneration, markCleanUpTo, markSyncing } from "../state/studio-save-status";
import { canPersistWork } from "../state/studio-load-state";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { normalizePages, serializePages } from "@bitgrain/studio-core/io/serialize-pages";
import { useWorkLoader } from "./use-work-loader";
import { markProjectOpen } from "@bitgrain/platform/projects/cloud-usage/open-projects";
import { cachedCoverThumbnail } from "./persist/cover-thumbnail-cache";

const THUMB_W = 400;

interface UseStudioPersistArgs {
  workId: string | undefined;
  template: TemplateDef;
  layers: Layer[];
  background: string;
  pages: TemplatePage[];
  canvasW: number;
  canvasH: number;
  image: string | null;
  workNameRef: React.MutableRefObject<string>;
  workCreatedAtRef: React.MutableRefObject<number>;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  setImage: (i: string | null) => void;
  setWorkName: (n: string) => void;
}

interface UseStudioPersistResult {
  handleManualSave: () => Promise<CloudSyncOutcome>;
  retryLoad: () => Promise<void>;
}

const renderThumbnail = async (
  template: TemplateDef, background: string, layers: Layer[], image: string | null,
): Promise<string | null> => {
  const thumbH = Math.round((THUMB_W * template.height) / template.width);
  try {
    return await renderStudioToDataUrl(template, background, layers, image, THUMB_W, thumbH);
  } catch {
    return null;
  }
};

export const useStudioPersist = ({
  workId, template, layers, background, pages, canvasW, canvasH, image,
  workNameRef, workCreatedAtRef,
  setPages, setActivePageId, setCanvasW, setCanvasH, setImage, setWorkName,
}: UseStudioPersistArgs): UseStudioPersistResult => {
  const applyLoadedWork = (work: Work): void => {
    const restoredPages = normalizePages(work.pages, {
      layers: work.layers as Layer[], background: work.background, width: work.canvasW, height: work.canvasH,
    });
    setPages(restoredPages);
    setActivePageId(restoredPages[0].id);
    setCanvasW(work.canvasW);
    setCanvasH(work.canvasH);
    if (work.image) setImage(work.image);
    workNameRef.current = work.name;
    setWorkName(work.name);
    workCreatedAtRef.current = work.createdAt;
  };

  const retryLoad = useWorkLoader({ workId, onWorkLoaded: applyLoadedWork });

  useEffect(() => (workId ? markProjectOpen(workId) : undefined), [workId]);

  const buildWork = useCallback((id: string): Work => ({
    id,
    name: workNameRef.current,
    thumbnail: null,
    background, canvasW, canvasH, layers,
    pages: serializePages(pages),
    image,
    createdAt: workCreatedAtRef.current,
    updatedAt: Date.now(),
  }), [layers, background, pages, canvasW, canvasH, image, workNameRef, workCreatedAtRef]);

  const renderCover = useCallback(async (): Promise<string | null> => {
    const cover = pages[0];
    const coverTemplate = { ...template, width: cover?.width ?? canvasW, height: cover?.height ?? canvasH };
    return cover
      ? await cachedCoverThumbnail(cover, template, () =>
        renderThumbnail(coverTemplate, cover.background, cover.layers, cover.image ?? null))
      : await renderThumbnail(coverTemplate, background, layers, image);
  }, [template, layers, background, pages, canvasW, canvasH, image]);

  const handleManualSave = useCallback(async (): Promise<CloudSyncOutcome> => {
    if (!workId || !canPersistWork()) return "failed";
    const generation = currentEditGeneration();
    const work = buildWork(workId);
    if (await stageWorkLocally(work)) {
      markCleanUpTo(generation);
      markSyncing();
    }
    const outcome = await saveWork({ ...work, thumbnail: await renderCover() });
    if (outcome === "failed") return outcome;
    markCleanUpTo(generation);
    trackEvent("studio", "manual_save");
    return outcome;
  }, [workId, buildWork, renderCover]);

  return { handleManualSave, retryLoad };
};
