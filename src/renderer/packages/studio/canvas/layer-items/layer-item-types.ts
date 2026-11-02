import type React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";

export interface LayerItemHandlers extends Record<string, (...args: never[]) => unknown> {
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onReparentCheck: (id: string) => void;
}

export interface LayerGate {
  isSpacePressed: boolean;
  isGrabMode: boolean;
}

export interface CommonLayerProps {
  scale: number;
  zIndex: number;
  hideSelectionUi: boolean;
  interactive: boolean;
  onSelect: (multi?: boolean) => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export const isLayerGated = (layer: Layer, gate: LayerGate): boolean =>
  gate.isSpacePressed || gate.isGrabMode || layer.locked;
