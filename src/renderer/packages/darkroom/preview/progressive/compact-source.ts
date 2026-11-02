const COMPACT_SOURCE_MAX_EDGE = 1024;
const MAX_CACHED_SOURCES = 4;

export interface CompactSource {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

const sources = new Map<string, Promise<CompactSource>>();

const decodeCompactSource = async (url: string): Promise<CompactSource> => {
  const response = await fetch(url);
  const full = await createImageBitmap(await response.blob());
  const { width, height } = full;
  const scale = Math.min(1, COMPACT_SOURCE_MAX_EDGE / Math.max(width, height));
  if (scale >= 1) return { bitmap: full, width, height };
  const bitmap = await createImageBitmap(full, {
    resizeWidth: Math.max(1, Math.round(width * scale)),
    resizeHeight: Math.max(1, Math.round(height * scale)),
    resizeQuality: "high",
  });
  full.close();
  return { bitmap, width, height };
};

const evictOldest = (): void => {
  if (sources.size <= MAX_CACHED_SOURCES) return;
  const oldest = sources.keys().next().value;
  if (oldest !== undefined) sources.delete(oldest);
};

export const loadCompactSource = (url: string): Promise<CompactSource> => {
  const cached = sources.get(url);
  if (cached) return cached;
  const request = decodeCompactSource(url);
  sources.set(url, request);
  evictOldest();
  request.catch(() => sources.delete(url));
  return request;
};
