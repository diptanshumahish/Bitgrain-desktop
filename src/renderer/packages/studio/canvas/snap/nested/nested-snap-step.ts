import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import type { SnapRect } from "../snap-engine";
import { resolveSnap, type SnapOverlay } from "../snap-resolve";
import { computeResizeSnap, resizedRect } from "../snap-resize";
import { measureGaps } from "../snap-measure";
import { layoutGridAidLines } from "../snap-aid-lines";
import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";

export type SnapGestureKind = "move" | "resize";

export interface SnapSession {
  id: string;
  kind: SnapGestureKind;
  startRect: SnapRect;
  accumDx: number;
  accumDy: number;
  appliedX: number;
  appliedY: number;
}

export interface SnapBounds {
  width: number;
  height: number;
  layoutGrids?: LayoutGrid[];
}

export interface SnapStep {
  session: SnapSession;
  dx: number;
  dy: number;
  overlay: SnapOverlay;
}

interface StepInput {
  session: SnapSession;
  dx: number;
  dy: number;
  targets: SnapRect[];
  bounds: SnapBounds;
  threshold: number;
}

export const EMPTY_SNAP_OVERLAY: SnapOverlay = { guides: [], measurements: [] };

export const startSnapSession = (id: string, kind: SnapGestureKind, startRect: SnapRect): SnapSession => ({
  id, kind, startRect, accumDx: 0, accumDy: 0, appliedX: 0, appliedY: 0,
});

const accumulate = (session: SnapSession, dx: number, dy: number): SnapSession => ({
  ...session,
  accumDx: session.accumDx + dx,
  accumDy: session.accumDy + dy,
});

const finishStep = (
  session: SnapSession,
  input: StepInput,
  correction: { x: number; y: number },
  overlay: SnapOverlay,
): SnapStep => ({
  session: { ...session, appliedX: correction.x, appliedY: correction.y },
  dx: input.dx + (correction.x - session.appliedX),
  dy: input.dy + (correction.y - session.appliedY),
  overlay,
});

export const moveSnapStep = (input: StepInput): SnapStep => {
  const session = accumulate(input.session, input.dx, input.dy);
  const moving: SnapRect = {
    ...session.startRect,
    x: session.startRect.x + session.accumDx,
    y: session.startRect.y + session.accumDy,
  };
  const snap = resolveSnap(moving, input.targets, input.bounds, input.threshold, layoutGridAidLines(input.bounds));
  return finishStep(session, input, { x: snap.correctionX, y: snap.correctionY }, snap);
};

export const resizeSnapStep = (input: StepInput, dir: HandleDir): SnapStep => {
  const session = accumulate(input.session, input.dx, input.dy);
  const resizing = resizedRect(session.startRect, dir, session.accumDx, session.accumDy);
  const snap = computeResizeSnap(resizing, dir, input.targets, input.bounds, input.threshold, layoutGridAidLines(input.bounds));
  const snapped = resizedRect(session.startRect, dir, session.accumDx + snap.correctionX, session.accumDy + snap.correctionY);
  const overlay: SnapOverlay = { guides: snap.guides, measurements: measureGaps(snapped, input.targets, input.bounds) };
  return finishStep(session, input, { x: snap.correctionX, y: snap.correctionY }, overlay);
};
