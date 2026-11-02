import { signal } from "@bitgrain/core/signal";

const previewShowsDraftSignal = signal(false);

let flushFullRender: () => void = () => {};

export const setFullRenderFlusher = (flush: () => void): void => {
  flushFullRender = flush;
};

export const markPreviewDraft = (showsDraft: boolean): void => {
  previewShowsDraftSignal.value = showsDraft;
};

export const waitForFullPreview = (timeoutMs: number): Promise<boolean> => {
  if (!previewShowsDraftSignal.value) return Promise.resolve(true);
  flushFullRender();
  return new Promise((resolve) => {
    const settle = (settled: boolean): void => {
      window.clearTimeout(timer);
      unsubscribe();
      resolve(settled);
    };
    const timer = window.setTimeout(() => settle(false), timeoutMs);
    const unsubscribe = previewShowsDraftSignal.subscribe(() => {
      if (!previewShowsDraftSignal.value) settle(true);
    });
  });
};
