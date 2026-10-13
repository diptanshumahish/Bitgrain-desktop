import { useCallback, useEffect, useState } from "react";
import { DEFAULT_VECTOR_SETTINGS, type VectorSettings, type ShapeType } from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { trackEvent } from "../../../lib/tracker";

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
  const [nodeEditMode, setNodeEditMode] = useState<NodeEditMode>("bend");
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
      if (event.key === "h" || event.key === "H") {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "grab" } });
        setGrabMode(true);
        setDrawingMode(false);
        setPencilMode(false);
        setBrushMode(false);
        setFrameDrawMode(false);
        setPlacementTool(null);
      }
      if (event.key === "v" || event.key === "V") {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "select" } });
        setGrabMode(false);
        setDrawingMode(false);
        setPencilMode(false);
        setBrushMode(false);
        setFrameDrawMode(false);
        setPlacementTool(null);
      }
      if (event.key === "p" || event.key === "P") {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: event.shiftKey ? "pencil" : "pen" } });
        setGrabMode(false);
        setBrushMode(false);
        setFrameDrawMode(false);
        setPlacementTool(null);
        if (event.shiftKey) {
          setPencilMode((prev) => !prev);
          setDrawingMode(false);
        } else {
          setDrawingMode((prev) => !prev);
          setPencilMode(false);
        }
      }
      if (event.key === "b" || event.key === "B") {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "brush" } });
        setGrabMode(false);
        setDrawingMode(false);
        setPencilMode(false);
        setFrameDrawMode(false);
        setBrushMode((prev) => !prev);
        setPlacementTool(null);
      }
      if (event.key === "f" || event.key === "F") {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "frame" } });
        setGrabMode(false);
        setDrawingMode(false);
        setPencilMode(false);
        setBrushMode(false);
        setPlacementTool(null);
        setFrameDrawMode((prev) => !prev);
      }
      const hasModifier = event.metaKey || event.ctrlKey || event.altKey;
      if (!hasModifier && (event.key === "r" || event.key === "R")) {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "rectangle" } });
        selectPlacement({ kind: "shape", shapeType: "rect" });
      }
      if (!hasModifier && (event.key === "t" || event.key === "T")) {
        trackEvent("studio", "tool_shortcut_used", { details: { tool: "text" } });
        selectPlacement({ kind: "text" });
      }
      if (event.key === "Escape") {
        setGrabMode(false);
        setDrawingMode(false);
        setPencilMode(false);
        setBrushMode(false);
        setFrameDrawMode(false);
        setPlacementTool(null);
        onEndVectorEdit();
      }
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
  }, [onEndVectorEdit, wrapRef, isSpaceRef, isSpacePressedRef, grabModeRef, setIsSpaceActive, setGrabMode, dragRef, selectPlacement]);

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
