import { useCallback, useMemo, useReducer, useState } from "react";
import type { FrameLayer, Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import {
  duplicatePage,
  getTemplatePages,
  makeBlankPage,
  nextPageX,
} from "@bitgrain/studio-core/templates/template-pages";
import { makeFrameId } from "@bitgrain/studio-core/templates/frame-page-bridge";
import { updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import {
  computeContentOrigin,
  insertLayerIntoTarget,
  locateNode,
  removeLayerById,
  reparentLayer,
  updateContainerLayers,
} from "@bitgrain/studio-core/layers/frame-tree";
import { syncHugSizes } from "@bitgrain/studio-core/layout/auto-layout";
import { resizePageLayers } from "./page-resize/resize-page-layers";
import { syncPagesReducer } from "../features/design-components/hooks/sync-pages-reducer";

const MIN_PAGE_SIDE = 50;
const MAX_PAGE_SIDE = 10000;

const clampPageSide = (value: number): number =>
  Math.min(MAX_PAGE_SIDE, Math.max(MIN_PAGE_SIDE, Math.round(value)));

type LayersUpdater = Layer[] | ((prev: Layer[]) => Layer[]);
type BackgroundUpdater = string | ((prev: string) => string);

const DEFAULT_FRAME_BACKGROUND = "#ffffff";

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FrameOptions {
  name?: string;
  background?: string;
  clip?: boolean;
}

interface FramePatch {
  name?: string;
  background?: string;
  backgroundVar?: string;
  clip?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface UseStudioPagesArgs {
  initialTemplate: TemplateDef;
}

export interface UseStudioPagesResult {
  pages: TemplatePage[];
  activePageId: string;
  activePageIndex: number;
  layers: Layer[];
  background: string;
  setLayers: (updater: LayersUpdater) => void;
  setBackground: (updater: BackgroundUpdater) => void;
  setLayersForPage: (pageId: string, updater: LayersUpdater) => void;
  updatePage: (pageId: string, updater: (page: TemplatePage) => TemplatePage) => void;
  setPagePosition: (pageId: string, x: number, y: number) => void;
  setPageSize: (pageId: string, width: number, height: number) => void;
  setPageTransform: (pageId: string, x: number, y: number, width: number, height: number, scaleLayers?: boolean) => void;
  setPageBackgroundForPage: (pageId: string, background: string) => void;
  bindPageBackground: (pageId: string, background: string, backgroundVar?: string) => void;
  setPageImage: (pageId: string, image: string | null) => void;
  setActivePageId: (id: string) => void;
  setPages: (pages: TemplatePage[]) => void;
  resetPagesFromTemplate: (template: TemplateDef) => TemplatePage[];
  addPage: () => string;
  duplicateActivePage: () => string | null;
  duplicatePageById: (pageId: string) => string | null;
  deletePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setLayersForFrame: (frameId: string, updater: LayersUpdater) => void;
  updateFrame: (frameId: string, patch: FramePatch) => void;
  addFrame: (parentId: string | null, rect: FrameRect, opts?: FrameOptions) => string;
  deleteFrame: (frameId: string) => void;
  reparentFrame: (
    frameId: string,
    newParentId: string | null,
    dropLocal?: { x: number; y: number },
  ) => void;
  moveLayersToFrame: (layerIds: string[], targetFrameId: string) => void;
}

const resolveLayers = (current: Layer[], updater: LayersUpdater): Layer[] =>
  syncHugSizes(typeof updater === "function" ? updater(current) : updater);

const resizePage = (page: TemplatePage, width: number, height: number): TemplatePage => {
  const nextW = Number.isFinite(width) ? clampPageSide(width) : page.width;
  const nextH = Number.isFinite(height) ? clampPageSide(height) : page.height;
  return { ...page, width: nextW, height: nextH, layers: resizePageLayers(page, nextW, nextH) };
};

const resolveBackground = (
  current: string,
  updater: BackgroundUpdater,
): string => (typeof updater === "function" ? updater(current) : updater);

export const useStudioPages = ({
  initialTemplate,
}: UseStudioPagesArgs): UseStudioPagesResult => {
  const initialPages = useMemo(
    () => getTemplatePages(initialTemplate),
    [initialTemplate],
  );
  const [pages, setPagesState] = useReducer(syncPagesReducer, initialPages);
  const [activePageId, setActivePageId] = useState<string>(initialPages[0].id);

  const activePageIndex = pages.findIndex((page) => page.id === activePageId);
  const safeIndex = activePageIndex >= 0 ? activePageIndex : 0;
  const activePage = pages[safeIndex];

  const setLayers = useCallback(
    (updater: LayersUpdater) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === activePageId
            ? { ...page, layers: resolveLayers(page.layers, updater) }
            : page,
        ),
      );
    },
    [activePageId],
  );

  const setLayersForPage = useCallback(
    (pageId: string, updater: LayersUpdater) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? { ...page, layers: resolveLayers(page.layers, updater) }
            : page,
        ),
      );
    },
    [],
  );

  const updatePage = useCallback(
    (pageId: string, updater: (page: TemplatePage) => TemplatePage) => {
      setPagesState((prev) =>
        prev.map((page) => (page.id === pageId ? updater(page) : page)),
      );
    },
    [],
  );

  const setPagePosition = useCallback(
    (pageId: string, x: number, y: number) => {
      setPagesState((prev) =>
        prev.map((page) => (page.id === pageId ? { ...page, x, y } : page)),
      );
    },
    [],
  );

  const setPageSize = useCallback(
    (pageId: string, width: number, height: number) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === pageId ? resizePage(page, width, height) : page,
        ),
      );
    },
    [],
  );

  const setPageTransform = useCallback(
    (pageId: string, x: number, y: number, width: number, height: number, scaleLayers: boolean = false) => {
      setPagesState((prev) =>
        prev.map((page) => {
          if (page.id !== pageId) return page;
          const newW = clampPageSide(width);
          const newH = clampPageSide(height);
          const layers = scaleLayers ? resizePageLayers(page, newW, newH) : page.layers;
          return {
            ...page,
            x: Math.round(x),
            y: Math.round(y),
            width: newW,
            height: newH,
            layers,
          };
        }),
      );
    },
    [],
  );

  const setPageBackgroundForPage = useCallback(
    (pageId: string, background: string) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === pageId ? { ...page, background, backgroundVar: undefined } : page,
        ),
      );
    },
    [],
  );

  const bindPageBackground = useCallback(
    (pageId: string, background: string, backgroundVar?: string) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === pageId ? { ...page, background, backgroundVar } : page,
        ),
      );
    },
    [],
  );

  const setPageImage = useCallback(
    (pageId: string, image: string | null) => {
      setPagesState((prev) =>
        prev.map((page) => (page.id === pageId ? { ...page, image } : page)),
      );
    },
    [],
  );

  const setBackground = useCallback(
    (updater: BackgroundUpdater) => {
      setPagesState((prev) =>
        prev.map((page) =>
          page.id === activePageId
            ? {
                ...page,
                background: resolveBackground(page.background, updater),
                backgroundVar: undefined,
              }
            : page,
        ),
      );
    },
    [activePageId],
  );

  const setPages = useCallback((nextPages: TemplatePage[]) => {
    setPagesState(nextPages);
  }, []);

  const resetPagesFromTemplate = useCallback((template: TemplateDef): TemplatePage[] => {
    const next = getTemplatePages(template);
    setPagesState(next);
    setActivePageId(next[0].id);
    return next;
  }, []);

  const addPage = useCallback((): string => {
    const page = makeBlankPage(
      activePage?.background ?? DEFAULT_FRAME_BACKGROUND,
      pages.length + 1,
      activePage?.width ?? initialTemplate.width,
      activePage?.height ?? initialTemplate.height,
      nextPageX(pages),
      activePage?.y ?? 0,
    );
    setPagesState((prev) => [...prev, page]);
    return page.id;
  }, [pages, activePage, initialTemplate.width, initialTemplate.height]);

  const duplicatePageById = useCallback((pageId: string): string | null => {
    const source = pages.find((page) => page.id === pageId);
    if (!source) return null;
    const next = duplicatePage(source, nextPageX(pages));
    setPagesState((prev) => {
      const sourceIndex = prev.findIndex((page) => page.id === pageId);
      return [...prev.slice(0, sourceIndex + 1), next, ...prev.slice(sourceIndex + 1)];
    });
    return next.id;
  }, [pages]);

  const duplicateActivePage = useCallback(
    (): string | null => (activePage ? duplicatePageById(activePage.id) : null),
    [activePage, duplicatePageById],
  );

  const deletePage = useCallback(
    (id: string) => {
      setPagesState((prev) => {
        if (prev.length <= 1) {
          const target = prev.find((page) => page.id === id);
          if (!target) return prev;
          const fresh = makeBlankPage(
            target.background,
            1,
            target.width,
            target.height,
            target.x,
            target.y,
          );
          setActivePageId(fresh.id);
          return [fresh];
        }
        const next = prev.filter((page) => page.id !== id);
        if (id === activePageId) {
          setActivePageId(next[0].id);
        }
        return next;
      });
    },
    [activePageId],
  );

  const renamePage = useCallback((id: string, name: string) => {
    setPagesState((prev) =>
      prev.map((page) => (page.id === id ? { ...page, name } : page)),
    );
  }, []);

  const reorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPagesState((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length
        )
          return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [],
  );

  const setLayersForFrame = useCallback(
    (frameId: string, updater: LayersUpdater) => {
      setPagesState((prev) => {
        if (prev.some((page) => page.id === frameId)) {
          return prev.map((page) =>
            page.id === frameId
              ? { ...page, layers: resolveLayers(page.layers, updater) }
              : page,
          );
        }
        return updateContainerLayers(prev, frameId, (children) =>
          resolveLayers(children, updater),
        );
      });
    },
    [],
  );

  const updateFrame = useCallback((frameId: string, patch: FramePatch) => {
    setPagesState((prev) => {
      if (prev.some((page) => page.id === frameId)) {
        return prev.map((page) =>
          page.id === frameId ? { ...page, ...patch } : page,
        );
      }
      return prev.map((page) => ({
        ...page,
        layers: updateLayersRecursively(
          page.layers,
          [frameId],
          () => patch as Partial<Layer>,
        ),
      }));
    });
  }, []);

  const addFrame = useCallback(
    (parentId: string | null, rect: FrameRect, opts: FrameOptions = {}): string => {
      const id = makeFrameId();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (parentId === null) {
        setPagesState((prev) => [
          ...prev,
          {
            id,
            name: opts.name ?? `Frame ${prev.length + 1}`,
            layers: [],
            background: opts.background ?? DEFAULT_FRAME_BACKGROUND,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width,
            height,
            image: null,
            clip: opts.clip ?? true,
          },
        ]);
        setActivePageId(id);
        return id;
      }
      setPagesState((prev) => {
        const origin = computeContentOrigin(prev, parentId);
        if (!origin) return prev;
        const frame: FrameLayer = {
          id,
          type: "frame",
          name: opts.name ?? "Frame",
          x: Math.round(rect.x - origin.x),
          y: Math.round(rect.y - origin.y),
          width,
          height,
          opacity: 1,
          locked: false,
          visible: true,
          layers: [],
          background: opts.background ?? DEFAULT_FRAME_BACKGROUND,
          clip: opts.clip ?? true,
        };
        return insertLayerIntoTarget(prev, parentId, frame);
      });
      return id;
    },
    [],
  );

  const deleteFrame = useCallback(
    (frameId: string) => {
      setPagesState((prev) => {
        if (prev.some((page) => page.id === frameId)) {
          const next = prev.filter((page) => page.id !== frameId);
          if (frameId === activePageId) setActivePageId(next[0]?.id ?? "");
          return next;
        }
        return prev.map((page) => ({
          ...page,
          layers: removeLayerById(page.layers, frameId).layers,
        }));
      });
    },
    [activePageId],
  );

  const reparentFrame = useCallback(
    (
      frameId: string,
      newParentId: string | null,
      dropLocal?: { x: number; y: number },
    ) => {
      setPagesState((prev) => {
        const result = reparentLayer(prev, frameId, newParentId, dropLocal);
        if (result.promotedPageId) {
          setActivePageId(result.promotedPageId);
        } else if (
          result.demotedFromPageId &&
          result.demotedFromPageId === activePageId
        ) {
          const host = newParentId
            ? locateNode(result.pages, newParentId)?.page.id
            : undefined;
          setActivePageId(host ?? result.pages[0]?.id ?? "");
        }
        return result.pages;
      });
    },
    [activePageId],
  );

  const moveLayersToFrame = useCallback((layerIds: string[], targetFrameId: string) => {
    setPagesState((prev) => {
      const moved = layerIds.reduce((current, layerId) => reparentLayer(current, layerId, targetFrameId).pages, prev);
      const hostPageId = locateNode(moved, targetFrameId)?.page.id;
      if (hostPageId) setActivePageId(hostPageId);
      return moved;
    });
  }, []);

  return {
    pages,
    activePageId,
    activePageIndex: safeIndex,
    layers: activePage ? activePage.layers : [],
    background: activePage?.background ?? initialTemplate.background,
    setLayers,
    setBackground,
    setLayersForPage,
    updatePage,
    setPagePosition,
    setPageSize,
    setPageTransform,
    setPageBackgroundForPage,
    bindPageBackground,
    setPageImage,
    setActivePageId,
    setPages,
    resetPagesFromTemplate,
    addPage,
    duplicateActivePage,
    duplicatePageById,
    deletePage,
    renamePage,
    reorderPages,
    setLayersForFrame,
    updateFrame,
    addFrame,
    deleteFrame,
    reparentFrame,
    moveLayersToFrame,
  };
};
