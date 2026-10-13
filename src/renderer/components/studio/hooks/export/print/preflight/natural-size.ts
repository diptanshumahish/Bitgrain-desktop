export interface NaturalSize {
  width: number;
  height: number;
}

const sizeCache = new Map<string, Promise<NaturalSize | null>>();

const loadSize = (src: string): Promise<NaturalSize | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

export const loadNaturalSize = (src: string): Promise<NaturalSize | null> => {
  const cached = sizeCache.get(src);
  if (cached) return cached;
  const pending = loadSize(src);
  sizeCache.set(src, pending);
  return pending;
};
