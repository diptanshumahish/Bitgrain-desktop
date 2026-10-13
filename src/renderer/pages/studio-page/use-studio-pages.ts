import { useCallback, useMemo, useState } from "react";
import type { FrameLayer, Layer, TemplateDef, TemplatePage } from "../../data/studioTypes";
import {
  duplicatePage,
  getTemplatePages,
  makeBlankPage,
  nextPageX,
} from "../../data/templates/template-pages";
import { makeFrameId } from "../../data/templates/frame-page-bridge";
import { updateLayersRecursively } from "../../utils/studio-layers";
import {
  computeContentOrigin,
  insertLayerIntoTarget,
  locateNode,
  removeLayerById,
  reparentLayer,
  updateContainerLayers,
} from "../../utils/frame-tree";

type LayersUpdater = Layer[] | ((prev: Layer[]) => Layer[]);
type BackgroundUpdater = string | ((prev: string) => string);

const DEFAULT_FRAME_BACKGROUND = "#ffffff";

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameOptions {
  name?: string;
  background?: string;
  clip?: boolean;
}

export interface FramePatch {
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
  resetPagesFromTemplate: (template: TemplateDef) => void;
  addPage: () => string;
  addPageWithSize: (width: number, height: number, name?: string, x?: number, y?: number) => string;
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
  moveLayerToFrame: (
    layerId: string,
    targetFrameId: string,
    dropLocal?: { x: number; y: number },
  ) => void;
}

const resolveLayers = (current: Layer[], updater: LayersUpdater): Layer[] =>
  typeof updater === "function" ? updater(current) : updater;

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
  const [pages, setPagesState] = useState<TemplatePage[]>(initialPages);
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
          page.id === pageId
            ? {
                ...page,
                width: Number.isFinite(width) ? Math.max(50, Math.round(width)) : page.width,
                height: Number.isFinite(height) ? Math.max(50, Math.round(height)) : page.height,
              }
            : page,
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
          const newW = Math.max(50, Math.round(width));
          const newH = Math.max(50, Math.round(height));
          const scaleX = newW / page.width;
          const scaleY = newH / page.height;
          const layers = scaleLayers && (scaleX !== 1 || scaleY !== 1)
            ? page.layers.map((layer) => ({
                ...layer,
                x: Math.round(layer.x * scaleX),
                y: Math.round(layer.y * scaleY),
                width: Math.round(layer.width * scaleX),
                height: Math.round(layer.height * scaleY),
              }))
            : page.layers;
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

  const resetPagesFromTemplate = useCallback((template: TemplateDef) => {
    const next = getTemplatePages(template);
    setPagesState(next);
    setActivePageId(next[0].id);
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

  // Desktop: adds a blank frame at a specific size (predefined or custom). When
  // posX/posY are given the frame lands there; otherwise it is placed to the right
  // of the last frame. Uses a unique id so it can't collide with freed ids.
  const addPageWithSize = useCallback(
    (width: number, height: number, name?: string, posX?: number, posY?: number): string => {
      const w = Math.max(50, Math.round(width));
      const h = Math.max(50, Math.round(height));
      const id = crypto.randomUUID();
      setPagesState((prev) => {
        const x = posX !== undefined ? Math.round(posX) : nextPageX(prev);
        const y = posY !== undefined ? Math.round(posY) : prev[prev.length - 1]?.y ?? 0;
        const page = makeBlankPage(
          activePage?.background ?? initialTemplate.background ?? DEFAULT_FRAME_BACKGROUND,
          prev.length + 1,
          w,
          h,
          x,
          y,
        );
        return [...prev, { ...page, id, name: name ?? page.name }];
      });
      return id;
    },
    [activePage?.background, initialTemplate.background],
  );

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
      // The last frame can be deleted too — the studio then shows its empty state
      // (add a frame). Active selection moves to the first remaining frame, or none.
      setPagesState((prev) => {
        const next = prev.filter((page) => page.id !== id);
        if (id === activePageId) setActivePageId(next[0]?.id ?? "");
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

  const moveLayerToFrame = useCallback(
    (
      layerId: string,
      targetFrameId: string,
      dropLocal?: { x: number; y: number },
    ) => {
      setPagesState(
        (prev) => reparentLayer(prev, layerId, targetFrameId, dropLocal).pages,
      );
    },
    [],
  );

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
    addPageWithSize,
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
    moveLayerToFrame,
  };
};
