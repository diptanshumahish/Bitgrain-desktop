import { signal } from "@bitgrain/core/signal";

export const resizeSelectionSignal = signal<ReadonlySet<string>>(new Set());

export const clearResizeSelection = (): void => {
  resizeSelectionSignal.value = new Set();
};

export const selectResizeFormats = (ids: readonly string[]): void => {
  resizeSelectionSignal.value = new Set(ids);
};

export const toggleResizeFormat = (id: string, allowMany: boolean): void => {
  const current = resizeSelectionSignal.value;
  if (current.has(id)) {
    resizeSelectionSignal.value = new Set([...current].filter((selectedId) => selectedId !== id));
    return;
  }
  resizeSelectionSignal.value = allowMany ? new Set([...current, id]) : new Set([id]);
};
