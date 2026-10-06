import { useCallback, useEffect, useState } from "react";
import { saveStudioAutosave, loadStudioAutosave } from "../../utils/studio-persist";
import type { StudioAutosave, StudioAutosavePage } from "../../utils/studio-persist";
import { saveWork, loadWorks, getWorkById } from "../../store/works-store";
import type { Work } from "../../types/work";
import { renderStudioToDataUrl } from "../../components/studio/hooks/useStudioExport";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { markClean } from "../../store/studio-save-status";
import { readInstance, writeInstance } from "../../store/workspace-store";
import { setActiveTabTitle } from "../../store/document-tabs-store";
import type { Layer, TemplateDef, TemplatePage } from "../../data/studioTypes";
import { makePageId } from "../../data/templates/template-pages";

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
  pages: StudioAutosavePage[];
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

const normalizePages = (
  rawPages: unknown,
  fallbackLayers: Layer[],
  fallbackBackground: string,
  fallbackWidth: number,
  fallbackHeight: number,
): TemplatePage[] => {
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    return rawPages.map((page, index) => {
      const source = page as Partial<TemplatePage>;
      return {
        id: source.id ?? makePageId(index + 1),
        name: source.name ?? `Page ${index + 1}`,
        layers: Array.isArray(source.layers) ? (source.layers as Layer[]) : [],
        background: source.background ?? fallbackBackground,
        backgroundVar: source.backgroundVar,
        x: source.x ?? 0,
        y: source.y ?? 0,
        width: source.width ?? fallbackWidth,
        height: source.height ?? fallbackHeight,
        image: source.image ?? null,
        clip: source.clip,
        animation: source.animation,
      };
    });
  }
  return [
    {
      id: makePageId(1),
      name: "Page 1",
      layers: fallbackLayers,
      background: fallbackBackground,
      x: 0,
      y: 0,
      width: fallbackWidth,
      height: fallbackHeight,
    },
  ];
};

export interface UseStudioPersistResult {
  showRestoreToast: boolean;
  setShowRestoreToast: (v: boolean) => void;
  savedData: StudioAutosave | null;
  handleManualSave: () => Promise<void>;
  handleRestore: () => void;
}

const toStudioPages = (pages: TemplatePage[]): StudioAutosavePage[] =>
  pages.map((page) => ({
    id: page.id,
    name: page.name,
    layers: page.layers,
    background: page.background,
    x: page.x,
    y: page.y,
    width: page.width,
    height: page.height,
    image: page.image ?? null,
    animation: page.animation,
  }));

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
      const restoredPages = normalizePages(
        doc.pages,
        doc.layers as Layer[],
        doc.background,
        doc.canvasW,
        doc.canvasH,
      );
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

  useEffect(() => {
    if (instanceId) return;
    if (workId) {
      getWorkById(workId).then((work) => {
        if (!work) return;
        const restoredPages = normalizePages(
          work.pages,
          work.layers as Layer[],
          work.background,
          work.canvasW,
          work.canvasH,
        );
        setPages(restoredPages);
        setActivePageId(restoredPages[0].id);
        setCanvasW(work.canvasW);
        setCanvasH(work.canvasH);
        if (work.image) setImage(work.image);
        workNameRef.current = work.name;
        setWorkName(work.name);
        workCreatedAtRef.current = work.createdAt;
      });
      return;
    }
    loadStudioAutosave().then((saved) => {
      if (saved) {
        setSavedData(saved);
        setShowRestoreToast(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId]);

  const handleRestore = useCallback(() => {
    if (!savedData) return;
    const restoredPages = normalizePages(
      savedData.pages,
      savedData.layers as Layer[],
      savedData.background,
      savedData.canvasW,
      savedData.canvasH,
    );
    setPages(restoredPages);
    setActivePageId(savedData.activePageId ?? restoredPages[0].id);
    setCanvasW(savedData.canvasW);
    setCanvasH(savedData.canvasH);
    if (savedData.image) setImage(savedData.image);
    setShowRestoreToast(false);
    trackPosthog("studio_save_restored");
    trackEvent("studio", "autosave_restored");
  }, [savedData, setPages, setActivePageId, setCanvasW, setCanvasH, setImage]);

  const handleManualSave = useCallback(async () => {
    if (instanceId) {
      const thumbH = Math.round(THUMB_W * canvasH / canvasW);
      const effectiveTpl = { ...template, width: canvasW, height: canvasH };
      let thumbnail: string | null = null;
      try {
        thumbnail = await renderStudioToDataUrl(effectiveTpl, background, layers, image, THUMB_W, thumbH);
      } catch {
        thumbnail = null;
      }
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
        pages: toStudioPages(pages),
        activePageId,
      };
      await writeInstance({
        id: instanceId,
        kind: "studio",
        title: workNameRef.current || "Studio",
        doc,
        thumbnail,
      });
      setActiveTabTitle(workNameRef.current || "Studio");
      markClean();
      trackPosthog("studio_manual_save_completed");
      trackEvent("studio", "manual_save");
      return;
    }
    if (workId) {
      const thumbH = Math.round(THUMB_W * canvasH / canvasW);
      const effectiveTpl = { ...template, width: canvasW, height: canvasH };
      let thumbnail: string | null = null;
      try {
        thumbnail = await renderStudioToDataUrl(effectiveTpl, background, layers, image, THUMB_W, thumbH);
      } catch {
        thumbnail = null;
      }
      const work: Work = {
        id: workId,
        name: workNameRef.current,
        thumbnail,
        background, canvasW, canvasH, layers,
        pages: pages.map((page) => ({
          id: page.id,
          name: page.name,
          layers: page.layers,
          background: page.background,
          backgroundVar: page.backgroundVar,
          x: page.x,
          y: page.y,
          width: page.width,
          height: page.height,
          image: page.image ?? null,
          clip: page.clip,
          animation: page.animation,
        })),
        image,
        createdAt: workCreatedAtRef.current,
        updatedAt: Date.now(),
      };
      await saveWork(work);
      await loadWorks();
    } else {
      await saveStudioAutosave({
        layers, background, canvasW, canvasH, image,
        pages: pages.map((page) => ({
          id: page.id,
          name: page.name,
          layers: page.layers,
          background: page.background,
          backgroundVar: page.backgroundVar,
          x: page.x,
          y: page.y,
          width: page.width,
          height: page.height,
          image: page.image ?? null,
          clip: page.clip,
          animation: page.animation,
        })),
        activePageId,
        timestamp: Date.now(),
      });
    }
    markClean();
    trackPosthog("studio_manual_save_completed");
    trackEvent("studio", "manual_save");
  }, [workId, instanceId, template, layers, background, pages, activePageId, canvasW, canvasH, image, workNameRef, workCreatedAtRef]);

  return { showRestoreToast, setShowRestoreToast, savedData, handleManualSave, handleRestore };
};
