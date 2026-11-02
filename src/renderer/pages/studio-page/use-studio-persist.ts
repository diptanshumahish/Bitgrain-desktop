import { useCallback, useEffect, useState } from "react";
import { saveStudioAutosave, loadStudioAutosave } from "../../utils/studio-persist";
import type { StudioAutosave } from "../../utils/studio-persist";
import { saveWork, loadWorks } from "../../store/works-store";
import type { Work } from "../../types/work";
import { renderStudioToDataUrl } from "../../components/studio/hooks/useStudioExport";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { markClean } from "../../store/studio-save-status";
import { readInstance, writeInstance } from "../../store/workspace-store";
import { setActiveTabTitle } from "../../store/document-tabs-store";
import { canPersistWork } from "../../store/studio-load-state";
import type { CloudSyncOutcome } from "../../lib/save-to-cloud";
import type { Layer, TemplateDef, TemplatePage } from "../../data/studioTypes";
import { normalizePages, serializePages } from "./serialize-pages";
import { useWorkLoader } from "./use-work-loader";

const THUMB_W = 400;

// The studio document as written to a `.bitgrain` instance file on desktop. It
// carries the full multi-page canvas so a document reopens exactly as left.
interface StudioDoc {
  version: 1;
  kind: "studio";
  name: string;
  createdAt: number;
  background: string;
  canvasW: number;
  canvasH: number;
  image: string | null;
  layers: unknown[];
  pages: ReturnType<typeof serializePages>;
  activePageId: string;
}

interface UseStudioPersistArgs {
  workId: string | undefined;
  // Desktop workspace instance id. When present, the studio document is loaded
  // from and autosaved to this instance's `.bitgrain` file, and there is no
  // "restore last session" prompt: a new studio tab is always blank.
  instanceId?: string;
  template: TemplateDef;
  layers: Layer[];
  background: string;
  pages: TemplatePage[];
  activePageId: string;
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

export interface UseStudioPersistResult {
  showRestoreToast: boolean;
  setShowRestoreToast: (v: boolean) => void;
  savedData: StudioAutosave | null;
  handleManualSave: () => Promise<CloudSyncOutcome>;
  handleRestore: () => void;
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
  workId, instanceId, template, layers, background, pages, activePageId, canvasW, canvasH, image,
  workNameRef, workCreatedAtRef,
  setPages, setActivePageId, setCanvasW, setCanvasH, setImage, setWorkName,
}: UseStudioPersistArgs): UseStudioPersistResult => {
  const [showRestoreToast, setShowRestoreToast] = useState(false);
  const [savedData, setSavedData] = useState<StudioAutosave | null>(null);

  // Desktop instance mode: load this studio document from its `.bitgrain` file,
  // or start blank if it has none. No autosave-restore toast.
  useEffect(() => {
    if (!instanceId) return;
    let cancelled = false;
    readInstance<StudioDoc>(instanceId).then((loaded) => {
      if (cancelled || !loaded) return;
      const doc = loaded.doc;
      const restoredPages = normalizePages(doc.pages, {
        layers: doc.layers as Layer[], background: doc.background, width: doc.canvasW, height: doc.canvasH,
      });
      setPages(restoredPages);
      setActivePageId(doc.activePageId ?? restoredPages[0].id);
      setCanvasW(doc.canvasW);
      setCanvasH(doc.canvasH);
      if (doc.image) setImage(doc.image);
      if (doc.name) {
        workNameRef.current = doc.name;
        setWorkName(doc.name);
      }
      if (doc.createdAt) workCreatedAtRef.current = doc.createdAt;
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

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

  useEffect(() => {
    if (workId || instanceId) return;
    loadStudioAutosave().then((saved) => {
      if (!saved) return;
      setSavedData(saved);
      setShowRestoreToast(true);
    });
  }, [workId]);

  const handleRestore = useCallback(() => {
    if (!savedData) return;
    const restoredPages = normalizePages(savedData.pages, {
      layers: savedData.layers as Layer[], background: savedData.background,
      width: savedData.canvasW, height: savedData.canvasH,
    });
    setPages(restoredPages);
    setActivePageId(savedData.activePageId ?? restoredPages[0].id);
    setCanvasW(savedData.canvasW);
    setCanvasH(savedData.canvasH);
    if (savedData.image) setImage(savedData.image);
    setShowRestoreToast(false);
    trackPosthog("studio_save_restored");
    trackEvent("studio", "autosave_restored");
  }, [savedData, setPages, setActivePageId, setCanvasW, setCanvasH, setImage]);

  const saveCurrentWork = useCallback(async (id: string): Promise<CloudSyncOutcome> => {
    const cover = pages[0];
    const coverTemplate = { ...template, width: cover?.width ?? canvasW, height: cover?.height ?? canvasH };
    const work: Work = {
      id,
      name: workNameRef.current,
      thumbnail: cover
        ? await renderThumbnail(coverTemplate, cover.background, cover.layers, cover.image ?? null)
        : await renderThumbnail(coverTemplate, background, layers, image),
      background, canvasW, canvasH, layers,
      pages: serializePages(pages),
      image,
      createdAt: workCreatedAtRef.current,
      updatedAt: Date.now(),
    };
    const outcome = await saveWork(work);
    await loadWorks();
    return outcome;
  }, [template, layers, background, pages, canvasW, canvasH, image, workNameRef, workCreatedAtRef]);

  const saveDraftAutosave = useCallback(async (): Promise<CloudSyncOutcome> => {
    await saveStudioAutosave({
      layers, background, canvasW, canvasH, image,
      pages: serializePages(pages),
      activePageId,
      timestamp: Date.now(),
    });
    return "not_synced";
  }, [layers, background, canvasW, canvasH, image, pages, activePageId]);

  // Desktop: the instance's `.bitgrain` file is the store of record, so a written
  // file is a complete save (there is no cloud copy to fall behind).
  const saveInstance = useCallback(async (id: string): Promise<CloudSyncOutcome> => {
    const cover = pages[0];
    const coverTemplate = { ...template, width: cover?.width ?? canvasW, height: cover?.height ?? canvasH };
    const thumbnail = cover
      ? await renderThumbnail(coverTemplate, cover.background, cover.layers, cover.image ?? null)
      : await renderThumbnail(coverTemplate, background, layers, image);
    const doc: StudioDoc = {
      version: 1,
      kind: "studio",
      name: workNameRef.current,
      createdAt: workCreatedAtRef.current,
      background,
      canvasW,
      canvasH,
      image,
      layers,
      pages: serializePages(pages),
      activePageId,
    };
    await writeInstance({ id, kind: "studio", title: workNameRef.current || "Studio", doc, thumbnail });
    setActiveTabTitle(workNameRef.current || "Studio");
    return "saved";
  }, [template, layers, background, pages, activePageId, canvasW, canvasH, image, workNameRef, workCreatedAtRef]);

  const handleManualSave = useCallback(async (): Promise<CloudSyncOutcome> => {
    if (!canPersistWork()) return "failed";
    const outcome = instanceId
      ? await saveInstance(instanceId)
      : workId ? await saveCurrentWork(workId) : await saveDraftAutosave();
    if (outcome === "failed") return outcome;
    markClean();
    trackPosthog("studio_manual_save_completed");
    trackEvent("studio", "manual_save");
    return outcome;
  }, [workId, instanceId, saveInstance, saveCurrentWork, saveDraftAutosave]);

  return { showRestoreToast, setShowRestoreToast, savedData, handleManualSave, handleRestore, retryLoad };
};
