import { signal } from "@bitgrain/core/signal";
import { captureSnapshot, applySnapshot } from "./transform-store";
import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import { imageSignal } from "./image-store";

interface HistoryEntry {
  transform: TransformSnapshot;
  image: string | null;
}

interface HistoryImageBridge {
  canRestore: (url: string) => boolean;
  restore: (url: string) => void;
}

const captureEntry = (): HistoryEntry => ({ transform: captureSnapshot(), image: imageSignal.value });

const pastSignal = signal<HistoryEntry[]>([]);
const futureSignal = signal<HistoryEntry[]>([]);
const presentRef: { current: HistoryEntry } = { current: captureEntry() };
const imageBridgeRef: { current: HistoryImageBridge | null } = { current: null };

export const connectHistoryImage = (bridge: HistoryImageBridge): void => {
  imageBridgeRef.current = bridge;
};

const applyEntry = (entry: HistoryEntry): void => {
  applySnapshot(entry.transform);
  const bridge = imageBridgeRef.current;
  if (!bridge || !entry.image || entry.image === imageSignal.value || !bridge.canRestore(entry.image)) return;
  bridge.restore(entry.image);
};

export const canUndoSignal = signal(false);
export const canRedoSignal = signal(false);

const canRestoreImage = (url: string | null): boolean =>
  !!url && !!imageBridgeRef.current && imageBridgeRef.current.canRestore(url);

const isSameEntry = (present: HistoryEntry, current: HistoryEntry): boolean =>
  JSON.stringify(present.transform) === JSON.stringify(current.transform) &&
  (present.image === current.image || !canRestoreImage(current.image));

const syncFlags = (): void => {
  canUndoSignal.value = pastSignal.value.length > 0;
  canRedoSignal.value = futureSignal.value.length > 0;
};

const commitPending = (): void => {
  const current = captureEntry();
  if (isSameEntry(presentRef.current, current)) {
    presentRef.current = current;
    return;
  }
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
  presentRef.current = captureEntry();
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
  applyEntry(previous);
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
  applyEntry(next);
  syncFlags();
}
