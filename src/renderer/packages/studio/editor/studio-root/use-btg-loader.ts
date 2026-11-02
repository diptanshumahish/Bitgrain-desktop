import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CustomFontEntry, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";
import { applyBtgProject } from "../load-btg";
import { markDirty } from "../../state/studio-save-status";
import { requestCanvasFit } from "../../state/canvas-fit-request";

type CustomFontList = Array<{ label: string; dataUrl: string }>;

interface UseBtgLoaderArgs {
  routerProject: BTGStudioProject | undefined;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (width: number) => void;
  setCanvasH: (height: number) => void;
  setImage: (image: string | null) => void;
  resetHistory: () => void;
  setCustomFonts: (updater: (prev: CustomFontEntry[]) => CustomFontEntry[]) => void;
}

type LoadBtgHandler = (project: BTGStudioProject, customFontList: CustomFontList) => void;

export const useBtgLoader = (args: UseBtgLoaderArgs): LoadBtgHandler => {
  const { routerProject, setPages, setActivePageId, setCanvasW, setCanvasH, setImage, resetHistory, setCustomFonts } = args;
  const location = useLocation();
  const navigate = useNavigate();
  const routerProjectAppliedRef = useRef(false);

  const handleLoadBTG = useCallback(
    (project: BTGStudioProject, customFontList: CustomFontList) => {
      applyBtgProject({
        project, customFontList,
        setPages, setActivePageId, setCanvasW, setCanvasH, setImage,
        resetHistory, setCustomFonts,
      });
      markDirty();
      requestCanvasFit();
    },
    [resetHistory, setPages, setActivePageId, setImage, setCanvasW, setCanvasH, setCustomFonts],
  );

  useEffect(() => {
    if (!routerProject || routerProjectAppliedRef.current) return;
    routerProjectAppliedRef.current = true;
    queueMicrotask(() => handleLoadBTG(routerProject, routerProject.customFonts || []));
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [routerProject, handleLoadBTG, navigate, location.pathname, location.search]);

  return handleLoadBTG;
};
