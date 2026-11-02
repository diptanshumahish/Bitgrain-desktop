import { signal } from "@bitgrain/core/signal";

export const hoveredPageIdSignal = signal<string | null>(null);

export const markPageHovered = (pageId: string): void => {
  hoveredPageIdSignal.value = pageId;
};

export const clearPageHovered = (pageId: string): void => {
  if (hoveredPageIdSignal.value === pageId) hoveredPageIdSignal.value = null;
};
