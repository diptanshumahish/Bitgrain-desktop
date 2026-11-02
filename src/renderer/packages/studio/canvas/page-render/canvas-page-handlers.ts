import type React from "react";
import type { BezierAnchor, InkPoint, Layer, LayerPlacement, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";

export interface CanvasPageHandlers extends Record<string, (...args: never[]) => unknown> {
  onSelectPage: (id: string) => void;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateEnd: (id: string) => void;
  onReparentCheck: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
  onTitlePointerDown: (event: React.PointerEvent<HTMLDivElement>, page: TemplatePage) => void;
  onTitlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onTitlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onFrameResizeStart: (page: TemplatePage) => void;
  onFrameResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onFrameResizeEnd: () => void;
  onPagePressCapture: () => void;
  onPagePress: () => void;
  consumePagePress: () => boolean;
  isSpacePressed: () => boolean;
  activateDrawingPage: (pageId: string) => void;
  onVectorFinish: (anchors: BezierAnchor[], closed: boolean) => void;
  onPencilStroke: (anchors: BezierAnchor[]) => void;
  onInkFinish: (strokes: InkPoint[][]) => void;
  onPlace: (placement: LayerPlacement) => void;
}
