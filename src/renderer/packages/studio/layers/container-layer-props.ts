import type React from "react";
import type { FrameLayer, GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import type { NodeEditMode } from "../ui/NodeEditToolbar";

export interface ContainerLayerViewProps<T extends GroupLayer | FrameLayer> {
  layer: T;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  nodeEditMode: NodeEditMode;
  image: string | null;
  scale: number;
  zIndex: number;
  isSpacePressed: boolean;
  isGrabMode: boolean;
  hideSelectionUi?: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, rich: string) => void;
  onCommitText: (id: string, content: string, rich: string) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onLayerContextMenu?: (id: string, x: number, y: number) => void;
  onReparentCheck?: (id: string) => void;
}
