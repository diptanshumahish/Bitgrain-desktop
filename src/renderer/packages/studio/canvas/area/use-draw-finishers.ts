import { useCallback, useMemo, useRef } from "react";
import type { BezierAnchor, InkPoint, LayerPlacement, VectorSettings } from "@bitgrain/studio-core/model/studio-types";
import { DEFAULT_VECTOR_SETTINGS } from "@bitgrain/studio-core/model/studio-types";
import { getContrastColor } from "@bitgrain/core/color/contrast-color";
import type { CanvasAreaProps } from "./canvas-area-props";
import type { CanvasTools } from "./canvas-tool-types";

const MIN_PATH_ANCHORS = 2;

type DrawFinisherProps = Pick<CanvasAreaProps, "onSelectPage" | "onAddVector" | "onAddInk" | "onAddText" | "onAddShape">;

interface DrawFinisherInput extends DrawFinisherProps {
  tools: CanvasTools;
  activeBackground: string;
}

interface DrawFinishers {
  vectorSettings: VectorSettings;
  drawFlushRef: React.MutableRefObject<(() => void) | null>;
  activateDrawingPage: (pageId: string) => void;
  finishVector: (anchors: BezierAnchor[], closed: boolean) => void;
  finishPencilStroke: (anchors: BezierAnchor[]) => void;
  finishInk: (strokes: InkPoint[][]) => void;
  place: (placement: LayerPlacement) => void;
}

export const useDrawFinishers = ({
  tools, activeBackground, onSelectPage, onAddVector, onAddInk, onAddText, onAddShape,
}: DrawFinisherInput): DrawFinishers => {
  const autoStrokeColor = useMemo(() => getContrastColor(activeBackground), [activeBackground]);
  const vectorSettings = useMemo<VectorSettings>(() => {
    const isAuto = tools.vectorSettings.strokeColor === DEFAULT_VECTOR_SETTINGS.strokeColor;
    return isAuto ? { ...tools.vectorSettings, strokeColor: autoStrokeColor } : tools.vectorSettings;
  }, [tools.vectorSettings, autoStrokeColor]);

  const drawFlushRef = useRef<(() => void) | null>(null);
  const activateDrawingPage = useCallback((pageId: string): void => {
    drawFlushRef.current?.();
    onSelectPage(pageId);
  }, [onSelectPage]);

  const finishVector = useCallback((anchors: BezierAnchor[], closed: boolean): void => {
    if (anchors.length < MIN_PATH_ANCHORS) return;
    onAddVector(anchors, closed, vectorSettings);
  }, [onAddVector, vectorSettings]);

  const finishPencilStroke = useCallback((anchors: BezierAnchor[]): void => {
    if (anchors.length < MIN_PATH_ANCHORS) return;
    onAddVector(anchors, false, vectorSettings);
  }, [onAddVector, vectorSettings]);

  const finishInk = useCallback((strokes: InkPoint[][]): void => {
    if (strokes.length === 0) return;
    onAddInk(strokes, vectorSettings);
  }, [onAddInk, vectorSettings]);

  const place = useCallback((placement: LayerPlacement): void => {
    const tool = tools.placementTool;
    if (!tool) return;
    if (tool.kind === "text") onAddText(placement);
    else onAddShape(tool.shapeType, placement);
    tools.clearPlacement();
  }, [tools, onAddText, onAddShape]);

  return { vectorSettings, drawFlushRef, activateDrawingPage, finishVector, finishPencilStroke, finishInk, place };
};
