import { signal } from "@bitgrain/core/signal";

interface GuideSelection {
  pageId: string;
  guideId: string;
}

export const selectedGuideSignal = signal<GuideSelection | null>(null);

export const selectGuide = (selection: GuideSelection | null): void => {
  selectedGuideSignal.value = selection;
};
