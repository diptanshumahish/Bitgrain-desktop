import { signal } from "../lib/signal";
import type { ImageMeta } from "../components/ImageMetaPanel";

export const imageSignal = signal<string | null>(null);
export const isSampleSignal = signal(false);
export const imageMetaSignal = signal<ImageMeta | null>(null);
export const previewLoadingSignal = signal(false);

export const objectUrlRef = { current: null as string | null };

export function revokeCurrentObjectUrl(): void {
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }
}

const PREVIEW_LOADER_MAX_MS = 30_000;
let previewLoaderWatchdog: ReturnType<typeof setTimeout> | null = null;

previewLoadingSignal.subscribe(() => {
  if (previewLoaderWatchdog) {
    clearTimeout(previewLoaderWatchdog);
    previewLoaderWatchdog = null;
  }
  if (previewLoadingSignal.value) {
    previewLoaderWatchdog = setTimeout(() => {
      previewLoadingSignal.value = false;
      previewLoaderWatchdog = null;
    }, PREVIEW_LOADER_MAX_MS);
  }
});
