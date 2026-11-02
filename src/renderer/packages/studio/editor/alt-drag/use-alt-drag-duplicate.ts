import { useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isAltHeld } from "../../state/modifier-keys-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { insertClonesBelow } from "./insert-clones-below";

export interface AltDragDuplicate {
  onDragDelta: (movingIds: string[], setLayers: (updater: (prev: Layer[]) => Layer[]) => void) => void;
  onDragEnd: () => void;
}

export const useAltDragDuplicate = (): AltDragDuplicate => {
  const draggingRef = useRef(false);

  const onDragDelta = (movingIds: string[], setLayers: (updater: (prev: Layer[]) => Layer[]) => void): void => {
    if (draggingRef.current) return;
    draggingRef.current = true;
    if (!isAltHeld() || movingIds.length === 0) return;
    trackEvent("studio", "alt_drag_duplicate", { details: { count: movingIds.length } });
    setLayers((prev) => insertClonesBelow(prev, movingIds));
  };

  const onDragEnd = (): void => {
    draggingRef.current = false;
  };

  return { onDragDelta, onDragEnd };
};
