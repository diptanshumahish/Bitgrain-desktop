import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useStudioPages, type UseStudioPagesResult } from "../use-studio-pages";
import { markDirty } from "../../state/studio-save-status";
import { useStudioInit } from "../use-studio-init";
import { useStudioPaste } from "../use-studio-paste";

interface UseStudioDocumentArgs {
  initial: TemplateDef;
  routerImage: string | null;
}

export interface StudioDocument {
  template: TemplateDef;
  setTemplate: React.Dispatch<React.SetStateAction<TemplateDef>>;
  effectiveTemplate: TemplateDef;
  pagesApi: UseStudioPagesResult;
  activePage: TemplatePage | undefined;
  image: string | null;
  setImage: (value: string | null) => void;
  canvasW: number;
  canvasH: number;
  setCanvasW: React.Dispatch<React.SetStateAction<number>>;
  setCanvasH: React.Dispatch<React.SetStateAction<number>>;
  canvasWRef: React.MutableRefObject<number>;
  canvasHRef: React.MutableRefObject<number>;
  dragCanvasWRef: React.MutableRefObject<number | null>;
  dragCanvasHRef: React.MutableRefObject<number | null>;
}

const useRouterImage = (routerImage: string | null, pagesApi: UseStudioPagesResult): void => {
  const appliedRef = useRef(false);
  const { pages, setPageImage } = pagesApi;
  useEffect(() => {
    if (appliedRef.current || !routerImage || pages.length === 0) return;
    appliedRef.current = true;
    setPageImage(pages[0].id, routerImage);
    markDirty();
  }, [routerImage, pages, setPageImage]);
};

export const useStudioDocument = ({ initial, routerImage }: UseStudioDocumentArgs): StudioDocument => {
  const [template, setTemplate] = useState<TemplateDef>(initial);
  const pagesApi = useStudioPages({ initialTemplate: initial });
  const { pages, activePageId, setPageImage } = pagesApi;
  const [canvasW, setCanvasW] = useState(initial.width);
  const [canvasH, setCanvasH] = useState(initial.height);
  const canvasWRef = useRef(canvasW);
  const canvasHRef = useRef(canvasH);
  const dragCanvasWRef = useRef<number | null>(null);
  const dragCanvasHRef = useRef<number | null>(null);

  useEffect(() => {
    canvasWRef.current = canvasW;
    canvasHRef.current = canvasH;
  }, [canvasW, canvasH]);

  const activePage = useMemo(() => pages.find((page) => page.id === activePageId), [pages, activePageId]);
  const effectiveTemplate = useMemo(
    () => ({ ...template, width: canvasW, height: canvasH }),
    [template, canvasW, canvasH],
  );
  const setImage = useCallback(
    (value: string | null) => setPageImage(activePageId, value),
    [activePageId, setPageImage],
  );

  useStudioInit({ initial });
  useStudioPaste();
  useRouterImage(routerImage, pagesApi);

  return {
    template, setTemplate, effectiveTemplate, pagesApi, activePage,
    image: activePage?.image ?? null, setImage,
    canvasW, canvasH, setCanvasW, setCanvasH,
    canvasWRef, canvasHRef, dragCanvasWRef, dragCanvasHRef,
  };
};
