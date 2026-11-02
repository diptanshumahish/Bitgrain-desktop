import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { postPresenterMessage } from "./presenter-messages";
import { renderSlideImage } from "./render-slide-image";

interface SlideStream {
  channel: BroadcastChannel;
  pages: TemplatePage[];
  template: TemplateDef;
  startIndex: number;
  cache: Map<number, string>;
  isCancelled: () => boolean;
}

const streamOrder = (count: number, startIndex: number): number[] => {
  const all = Array.from({ length: count }, (_, index) => index);
  return [...all.slice(startIndex), ...all.slice(0, startIndex)];
};

const imageFor = async (stream: SlideStream, index: number): Promise<string | null> => {
  const cached = stream.cache.get(index);
  if (cached) return cached;
  try {
    const src = await renderSlideImage(stream.template, stream.pages[index]);
    stream.cache.set(index, src);
    return src;
  } catch {
    return null;
  }
};

export const streamSlideImages = async (stream: SlideStream): Promise<void> => {
  for (const index of streamOrder(stream.pages.length, stream.startIndex)) {
    const src = await imageFor(stream, index);
    if (stream.isCancelled()) return;
    if (src) postPresenterMessage(stream.channel, { type: "slide-image", index, src });
  }
};
