import { signal } from "@bitgrain/core/signal";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";

interface FindReplaceBridge {
  applyPages: (pages: TemplatePage[]) => void;
  reveal: (pageId: string, layerId: string) => void;
}

export const findReplaceOpenSignal = signal(false);
export const findQuerySignal = signal("");
export const replaceTextSignal = signal("");
export const matchCaseSignal = signal(false);
export const wholeWordSignal = signal(false);
export const activeMatchSignal = signal(0);
export const findPagesSignal = signal<TemplatePage[]>([]);

let bridge: FindReplaceBridge | null = null;

export const setFindReplaceBridge = (next: FindReplaceBridge | null): void => {
  bridge = next;
};

export const findReplaceBridge = (): FindReplaceBridge | null => bridge;
