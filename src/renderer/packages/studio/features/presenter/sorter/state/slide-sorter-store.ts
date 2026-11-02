import { signal } from "@bitgrain/core/signal";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";

interface SorterDocument {
  template: TemplateDef | null;
  activePageId: string;
}

export const slideSorterOpenSignal = signal<boolean>(false);
export const sorterSelectionSignal = signal<string[]>([]);
export const sorterDropIndexSignal = signal<number | null>(null);
export const sorterDocumentSignal = signal<SorterDocument>({ template: null, activePageId: "" });

export const openSlideSorter = (): void => {
  const { activePageId } = sorterDocumentSignal.value;
  sorterSelectionSignal.value = activePageId ? [activePageId] : [];
  slideSorterOpenSignal.value = true;
};

export const closeSlideSorter = (): void => {
  slideSorterOpenSignal.value = false;
  sorterDropIndexSignal.value = null;
};

export const toggleSlideSorter = (): void => {
  if (slideSorterOpenSignal.value) closeSlideSorter();
  else openSlideSorter();
};

export const setSorterSelection = (pageIds: string[]): void => {
  sorterSelectionSignal.value = pageIds;
};
