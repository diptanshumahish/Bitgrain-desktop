import { useCallback, useEffect, useState } from "react";
import { DEFAULT_VECTOR_SETTINGS, type VectorSettings, type ShapeType } from "@bitgrain/studio-core/model/studio-types";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { trackEvent } from "@bitgrain/platform/tracker";
import { commentModeSignal } from "../features/sharing/comment-state/comment-ui-store";
import { onCanvasTool, type CanvasTool } from "./canvas-tool-event";
import { TOOL_EVENT_NAMES, toolForKey } from "./tool-keys";

export type PlacementTool =
  | { kind: "text" }
  | { kind: "shape"; shapeType: ShapeType };

interface CanvasToolsConfig {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  isSpaceRef: React.MutableRefObject<boolean>;
  isSpacePressedRef: React.MutableRefObject<boolean>;
  grabModeRef: React.MutableRefObject<boolean>;
  setIsSpaceActive: (value: boolean) => void;
  setGrabMode: (value: boolean) => void;
  onEndVectorEdit: () => void;
  dragRef: React.MutableRefObject<{ startX: number; startY: number; panX: number; panY: number } | null>;
}

export const useCanvasTools = ({
  wrapRef,
  isSpaceRef,
  isSpacePressedRef,
  grabModeRef,
  setIsSpaceActive,
  setGrabMode,
  onEndVectorEdit,
  dragRef,
}: CanvasToolsConfig) => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [pencilMode, setPencilMode] = useState(false);
  const [brushMode, setBrushMode] = useState(false);
  const [frameDrawMode, setFrameDrawMode] = useState(false);
  const [nodeEditMode, setNodeEditMode] = useState<NodeEditMode>("move");
  const [vectorSettings, setVectorSettings] = useState<VectorSettings>(DEFAULT_VECTOR_SETTINGS);
  const [placementTool, setPlacementTool] = useState<PlacementTool | null>(null);

  const selectPlacement = useCallback((tool: PlacementTool) => {
    trackEvent("studio", "placement_tool_chosen", {
      details: { kind: tool.kind, shape_type: tool.kind === "shape" ? tool.shapeType : null },
    });
    setPlacementTool(tool);
    setDrawingMode(false);
    setPencilMode(false);
    setBrushMode(false);
    setFrameDrawMode(false);
    setGrabMode(false);
  }, [setGrabMode]);

  const clearPlacement = useCallback(() => setPlacementTool(null), []);

  useEffect(() => commentModeSignal.subscribe(() => {
    if (!commentModeSignal.value) return;
    setGrabMode(false);
    setDrawingMode(false);
    setPencilMode(false);
    setBrushMode(false);
    setFrameDrawMode(false);
    setPlacementTool(null);
    onEndVectorEdit();
  }), [setGrabMode, onEndVectorEdit]);

  const resetTools = useCallback((keep?: CanvasTool) => {
    setGrabMode(false);
    if (keep !== "pen") setDrawingMode(false);
    if (keep !== "pencil") setPencilMode(false);
    if (keep !== "brush") setBrushMode(false);
    if (keep !== "frame") setFrameDrawMode(false);
    setPlacementTool(null);
  }, [setGrabMode]);

  const activateTool = useCallback((tool: CanvasTool) => {
    if (tool === "rect") return selectPlacement({ kind: "shape", shapeType: "rect" });
    if (tool === "text") return selectPlacement({ kind: "text" });
    resetTools(tool);
    if (tool === "grab") setGrabMode(true);
    if (tool === "pen") setDrawingMode((prev) => !prev);
    if (tool === "pencil") setPencilMode((prev) => !prev);
    if (tool === "brush") setBrushMode((prev) => !prev);
    if (tool === "frame") setFrameDrawMode((prev) => !prev);
  }, [resetTools, selectPlacement, setGrabMode]);

  useEffect(() => onCanvasTool(activateTool), [activateTool]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        isSpaceRef.current = true;
        isSpacePressedRef.current = true;
        setIsSpaceActive(true);
        if (wrapRef.current && !dragRef.current) wrapRef.current.style.cursor = "grab";
      }
      if (event.metaKey || event.ctrlKey) return;
      if (event.key === "Escape") {
        resetTools();
        onEndVectorEdit();
        return;
      }
      const tool = toolForKey(event.key, event.shiftKey, event.altKey);
      if (!tool) return;
      trackEvent("studio", "tool_shortcut_used", { details: { tool: TOOL_EVENT_NAMES[tool] } });
      activateTool(tool);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      isSpaceRef.current = false;
      isSpacePressedRef.current = false;
      setIsSpaceActive(false);
      if (wrapRef.current && !dragRef.current) wrapRef.current.style.cursor = grabModeRef.current ? "grab" : "";
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onEndVectorEdit, wrapRef, isSpaceRef, isSpacePressedRef, grabModeRef, setIsSpaceActive, dragRef, resetTools, activateTool]);

  return {
    drawingMode,
    setDrawingMode,
    pencilMode,
    setPencilMode,
    brushMode,
    setBrushMode,
    frameDrawMode,
    setFrameDrawMode,
    nodeEditMode,
    setNodeEditMode,
    vectorSettings,
    setVectorSettings,
    placementTool,
    selectPlacement,
    clearPlacement,
  };
};
