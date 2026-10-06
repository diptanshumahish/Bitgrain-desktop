import type React from "react";
import { useDrag } from "./useDrag";

interface LayerDragOptions {
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  scale: number;
  selected: boolean;
  onSelect: (multi?: boolean) => void;
  // Defined for top-level layers, enabling select-on-press and drag without a
  // prior selecting click. Undefined for group children, which keep the older
  // click-based selection so their double-click drill-in still works.
  interactive?: boolean;
  // Extra reason the layer cannot be dragged right now (text editing, node editing).
  blocked?: boolean;
  onBeforePress?: (e: React.PointerEvent) => void;
}

interface LayerDragResult {
  directSelect: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

export const useLayerDrag = ({
  onMoveDelta,
  onMoveEnd,
  scale,
  selected,
  onSelect,
  interactive,
  blocked = false,
  onBeforePress,
}: LayerDragOptions): LayerDragResult => {
  const directSelect = interactive !== undefined;
  const disabled = blocked || (directSelect ? !interactive : !selected);

  const onPress =
    directSelect && !blocked
      ? (e: React.PointerEvent) => {
          onBeforePress?.(e);
          if (e.shiftKey) onSelect(true);
          else if (!selected) onSelect(false);
        }
      : undefined;

  const drag = useDrag(onMoveDelta, scale, disabled, onPress);

  return {
    directSelect,
    onPointerDown: drag.onPointerDown,
    onPointerMove: drag.onPointerMove,
    onPointerUp: () => {
      if (drag.onPointerUp()) onMoveEnd();
    },
  };
};
