import type {
  TemplateDef,
  TemplatePage,
  Layer,
  ShapeType,
  BezierAnchor,
  VectorSettings,
  InkPoint,
  LayerPlacement,
} from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import type { FrameRect } from "../../editor/use-studio-pages";

export interface CanvasAreaProps {
  template: TemplateDef;
  pages: TemplatePage[];
  activePageId: string;
  selectedFramePageId: string | null;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  zoom: number;
  onZoomChange: (z: number) => void;
  onSelectPage: (id: string) => void;
  onSelectFramePage: (id: string) => void;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onAddText: (placement?: LayerPlacement) => void;
  onAddShape: (type: ShapeType, placement?: LayerPlacement) => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onAddPattern: () => void;
  onMockup: () => void;
  onAddVector: (anchors: BezierAnchor[], closed: boolean, settings: VectorSettings) => void;
  onAddInk: (strokes: InkPoint[][], settings: VectorSettings) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onPageMoveStart: () => void;
  onPageMoveTo: (pageId: string, x: number, y: number) => void;
  onPageFrameTransform?: (pageId: string, x: number, y: number, width: number, height: number) => void;
  onRenamePage?: (id: string, name: string) => void;
  onAddFrame: (parentId: string | null, rect: FrameRect) => string;
  onReparentFrame: (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => void;
  onMoveLayersToFrame: (layerIds: string[], targetFrameId: string) => void;
}
