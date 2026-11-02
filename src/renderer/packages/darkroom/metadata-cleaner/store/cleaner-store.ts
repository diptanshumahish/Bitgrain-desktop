import { signal } from "@bitgrain/core/signal";
import type { MetadataKind } from "../strip/metadata-types";

type CleanStatus = "working" | "done" | "failed";

export interface CleanEntry {
  id: string;
  name: string;
  status: CleanStatus;
  found: MetadataKind[];
  rebuilt: boolean;
  blob: Blob | null;
  error: string | null;
}

export const cleanerEntriesSignal = signal<CleanEntry[]>([]);

export const putCleanEntry = (entry: CleanEntry): void => {
  const current = cleanerEntriesSignal.value;
  const exists = current.some((existing) => existing.id === entry.id);
  cleanerEntriesSignal.value = exists
    ? current.map((existing) => (existing.id === entry.id ? entry : existing))
    : [...current, entry];
};

export const resetCleaner = (): void => {
  cleanerEntriesSignal.value = [];
};
