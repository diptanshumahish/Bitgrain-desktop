import { signal } from "../lib/signal";
import { captureSnapshot, applySnapshot } from "./transform-store";
import type { TransformSnapshot } from "./transform-store";

const pastSignal = signal<TransformSnapshot[]>([]);
const futureSignal = signal<TransformSnapshot[]>([]);
const presentRef: { current: TransformSnapshot } = { current: captureSnapshot() };

export const canUndoSignal = signal(false);
export const canRedoSignal = signal(false);

const isSameSnapshot = (first: TransformSnapshot, second: TransformSnapshot): boolean =>
  JSON.stringify(first) === JSON.stringify(second);

const syncFlags = (): void => {
  canUndoSignal.value = pastSignal.value.length > 0;
  canRedoSignal.value = futureSignal.value.length > 0;
};

const commitPending = (): void => {
  const current = captureSnapshot();
  if (isSameSnapshot(presentRef.current, current)) return;
  pastSignal.value = [...pastSignal.value, presentRef.current];
  futureSignal.value = [];
  presentRef.current = current;
};

export function pushHistory(): void {
  commitPending();
  syncFlags();
}

export function resetHistory(): void {
  pastSignal.value = [];
  futureSignal.value = [];
  presentRef.current = captureSnapshot();
  syncFlags();
}

export function undoHistory(): void {
  commitPending();
  const past = pastSignal.value;
  if (past.length === 0) return;
  const previous = past[past.length - 1];
  pastSignal.value = past.slice(0, -1);
  futureSignal.value = [presentRef.current, ...futureSignal.value];
  presentRef.current = previous;
  applySnapshot(previous);
  syncFlags();
}

export function redoHistory(): void {
  commitPending();
  const future = futureSignal.value;
  if (future.length === 0) return;
  const next = future[0];
  pastSignal.value = [...pastSignal.value, presentRef.current];
  futureSignal.value = future.slice(1);
  presentRef.current = next;
  applySnapshot(next);
  syncFlags();
}
