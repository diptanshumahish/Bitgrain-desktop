import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { shapeToVectorLayer } from "@bitgrain/studio-core/geometry/shape-to-vector";
import { findLayerById, replaceLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import { handleCanvasResizeDelta } from "../canvas-resize-handler";
import { nudgeLayers, unlockedLayerIds } from "../selection-ops";
import type { GestureHistory } from "../use-gesture-history";
import type { AltDragDuplicate } from "../alt-drag/use-alt-drag-duplicate";
import type { StudioWorkspaceProps } from "./studio-workspace-props";

const DOCUMENT_ID = "__document__";

type GestureProps = Pick<
  StudioWorkspaceProps,
  | "layers" | "selectedIds" | "scaleContents" | "canvasWRef" | "canvasHRef" | "dragCanvasWRef" | "dragCanvasHRef"
  | "setSelectedIds" | "setLayers" | "setCanvasW" | "setCanvasH" | "setVectorEditingId" | "setSelectedFramePageId" | "pushHistory"
>;

interface GestureInput extends GestureProps {
  gestureHistory: GestureHistory;
  altDragDuplicate: AltDragDuplicate;
  rememberVectorConversion: (id: string, vectorLayer: ReturnType<typeof shapeToVectorLayer>) => void;
}

interface CanvasGestureCallbacks {
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateEnd: () => void;
}

const toggleId = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];

export const useCanvasGestureCallbacks = (input: GestureInput): CanvasGestureCallbacks => {
  const {
    layers, selectedIds, setSelectedIds, setLayers, setVectorEditingId, setSelectedFramePageId,
    pushHistory, gestureHistory, altDragDuplicate, rememberVectorConversion,
  } = input;

  const onSelectLayer = (id: string | null, multi?: boolean): void => {
    setSelectedFramePageId(null);
    if (multi && id) setSelectedIds((prev) => toggleId(prev, id));
    else setSelectedIds(id ? [id] : []);
  };

  const onSelectIds = (ids: string[]): void => {
    setSelectedFramePageId(null);
    setSelectedIds(ids);
  };

  const onStartVectorEdit = (id: string): void => {
    const target = findLayerById(layers, id);
    if (target?.type === "shape") {
      pushHistory();
      trackEvent("studio", "shape_converted_to_vector");
      const vectorLayer = shapeToVectorLayer(target);
      rememberVectorConversion(id, vectorLayer);
      setLayers((prev) => replaceLayerById(prev, id, vectorLayer));
    }
    setSelectedIds([id]);
    setVectorEditingId(id);
    trackEvent("studio", "vector_edit_started", { details: { layer_type: target?.type ?? "unknown" } });
  };

  const onMoveDelta = (id: string, dx: number, dy: number): void => {
    gestureHistory.beginGesture();
    const movingIds = selectedIds.includes(id) ? unlockedLayerIds(layers, selectedIds) : [id];
    altDragDuplicate.onDragDelta(movingIds, setLayers);
    setLayers((prev) => nudgeLayers(prev, movingIds, { dx, dy }));
  };

  const onMoveEnd = (): void => {
    altDragDuplicate.onDragEnd();
    gestureHistory.endGesture();
  };

  const onResizeDelta = (id: string, dir: HandleDir, dx: number, dy: number): void => {
    gestureHistory.beginGesture();
    handleCanvasResizeDelta({
      id, dir, dx, dy,
      documentId: DOCUMENT_ID,
      scaleContents: input.scaleContents,
      canvasWRef: input.canvasWRef,
      canvasHRef: input.canvasHRef,
      dragCanvasWRef: input.dragCanvasWRef,
      dragCanvasHRef: input.dragCanvasHRef,
      setCanvasW: input.setCanvasW,
      setCanvasH: input.setCanvasH,
      setLayers,
    });
  };

  const onResizeEnd = (): void => {
    input.dragCanvasWRef.current = null;
    input.dragCanvasHRef.current = null;
    gestureHistory.endGesture();
  };

  const onRotate = (id: string, rotation: number): void => {
    gestureHistory.beginGesture();
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, rotation } : layer)));
  };

  return {
    onSelectLayer, onSelectIds, onStartVectorEdit, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onRotate,
    onEndVectorEdit: () => setVectorEditingId(null),
    onRotateEnd: gestureHistory.endGesture,
  };
};
