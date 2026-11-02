import { useRef, useState } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { isShiftHeld } from "../../../state/modifier-keys-store";
import { isAspectLocked } from "../../../state/aspect-lock-store";
import type { SnapRect } from "../snap-engine";
import type { SnapOverlay } from "../snap-resolve";
import {
  EMPTY_SNAP_OVERLAY, moveSnapStep, resizeSnapStep, startSnapSession,
  type SnapBounds, type SnapGestureKind, type SnapSession, type SnapStep,
} from "./nested-snap-step";

const SCREEN_SNAP_THRESHOLD_PX = 6;
const MIN_SCALE = 0.0001;

interface SnapDelta {
  dx: number;
  dy: number;
}

interface UseNestedSnapArgs {
  siblings: Layer[];
  bounds: SnapBounds;
  scale: number;
}

interface NestedSnap {
  overlay: SnapOverlay;
  snapMove: (child: Layer, dx: number, dy: number) => SnapDelta;
  snapResize: (child: Layer, dir: HandleDir, dx: number, dy: number) => SnapDelta;
  endSnap: () => void;
}

const toRect = (layer: Layer): SnapRect => ({ x: layer.x, y: layer.y, width: layer.width, height: layer.height });

const siblingRects = (siblings: Layer[], childId: string): SnapRect[] =>
  siblings.filter((layer) => layer.id !== childId && layer.visible !== false).map(toRect);

const isRotated = (layer: Layer): boolean => ((layer as { rotation?: number }).rotation ?? 0) !== 0;

export const useNestedSnap = ({ siblings, bounds, scale }: UseNestedSnapArgs): NestedSnap => {
  const sessionRef = useRef<SnapSession | null>(null);
  const [overlay, setOverlay] = useState<SnapOverlay>(EMPTY_SNAP_OVERLAY);

  const clear = (): void => {
    sessionRef.current = null;
    setOverlay((prev) => (prev === EMPTY_SNAP_OVERLAY ? prev : EMPTY_SNAP_OVERLAY));
  };

  const sessionFor = (child: Layer, kind: SnapGestureKind): SnapSession => {
    const current = sessionRef.current;
    if (current && current.id === child.id && current.kind === kind) return current;
    return startSnapSession(child.id, kind, toRect(child));
  };

  const commit = (step: SnapStep): SnapDelta => {
    sessionRef.current = step.session;
    setOverlay(step.overlay);
    return { dx: step.dx, dy: step.dy };
  };

  const stepInput = (child: Layer, kind: SnapGestureKind, dx: number, dy: number) => ({
    session: sessionFor(child, kind),
    dx,
    dy,
    targets: siblingRects(siblings, child.id),
    bounds,
    threshold: SCREEN_SNAP_THRESHOLD_PX / Math.max(scale, MIN_SCALE),
  });

  const snapMove = (child: Layer, dx: number, dy: number): SnapDelta => {
    if (isShiftHeld()) {
      clear();
      return { dx, dy };
    }
    return commit(moveSnapStep(stepInput(child, "move", dx, dy)));
  };

  const snapResize = (child: Layer, dir: HandleDir, dx: number, dy: number): SnapDelta => {
    if (isShiftHeld() || isAspectLocked() || isRotated(child)) {
      clear();
      return { dx, dy };
    }
    return commit(resizeSnapStep(stepInput(child, "resize", dx, dy), dir));
  };

  return { overlay, snapMove, snapResize, endSnap: clear };
};
