import { useCallback, useEffect } from "react";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { normalizePages, serializePages } from "@bitgrain/studio-core/io/serialize-pages";
import { renderStudioToDataUrl } from "@bitgrain/studio/hooks/useStudioExport";
import { currentEditGeneration, markCleanUpTo } from "@bitgrain/studio/state/studio-save-status";
import { requestCanvasFit } from "@bitgrain/studio/state/canvas-fit-request";
import { readInstance, writeInstance } from "../../store/workspace-store";
import { setActiveTabTitle } from "../../store/document-tabs-store";

// The studio document as written to a desktop `.bitgrain` instance file. It
// carries the full multi-page canvas so a document reopens exactly as left. The
// instance file is the store of record on desktop (web saves to its cloud works
// store instead), so a written file is a complete save.
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

export interface DesktopStudioInstanceArgs {
  instanceId: string | undefined;
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
  setCanvasW: (width: number) => void;
  setCanvasH: (height: number) => void;
  setImage: (image: string | null) => void;
  setWorkName: (name: string) => void;
}

const THUMB_W = 400;
const DEFAULT_TITLE = "Studio";

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

const useInstanceLoad = (args: DesktopStudioInstanceArgs): void => {
  const { instanceId } = args;
  useEffect(() => {
    if (!instanceId) return;
    let cancelled = false;
    void readInstance<StudioDoc>(instanceId).then((loaded) => {
      if (cancelled || !loaded) return;
      const doc = loaded.doc;
      const restoredPages = normalizePages(doc.pages, {
        layers: doc.layers as Layer[], background: doc.background, width: doc.canvasW, height: doc.canvasH,
      });
      args.setPages(restoredPages);
      args.setActivePageId(doc.activePageId ?? restoredPages[0].id);
      args.setCanvasW(doc.canvasW);
      args.setCanvasH(doc.canvasH);
      if (doc.image) args.setImage(doc.image);
      if (doc.name) {
        args.workNameRef.current = doc.name;
        args.setWorkName(doc.name);
      }
      if (doc.createdAt) args.workCreatedAtRef.current = doc.createdAt;
      requestCanvasFit();
    });
    return () => {
      cancelled = true;
    };
    // Loads once per instance; the setters are stable state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);
};

export const useDesktopStudioInstance = (args: DesktopStudioInstanceArgs): (() => Promise<CloudSyncOutcome>) => {
  useInstanceLoad(args);
  const {
    instanceId, template, layers, background, pages, activePageId, canvasW, canvasH, image,
    workNameRef, workCreatedAtRef,
  } = args;

  return useCallback(async (): Promise<CloudSyncOutcome> => {
    if (!instanceId) return "failed";
    const generation = currentEditGeneration();
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
      background, canvasW, canvasH, image, layers,
      pages: serializePages(pages),
      activePageId,
    };
    const title = workNameRef.current || DEFAULT_TITLE;
    await writeInstance({ id: instanceId, kind: "studio", title, doc, thumbnail });
    setActiveTabTitle(title);
    markCleanUpTo(generation);
    return "saved";
  }, [instanceId, template, layers, background, pages, activePageId, canvasW, canvasH, image, workNameRef, workCreatedAtRef]);
};
