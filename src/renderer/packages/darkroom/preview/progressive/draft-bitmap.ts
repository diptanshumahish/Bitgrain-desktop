const DRAFT_SOURCE_MAX_EDGE = 1600;

export const createDraftBitmap = (source: ImageBitmap): Promise<ImageBitmap> => {
  const scale = Math.min(1, DRAFT_SOURCE_MAX_EDGE / Math.max(source.width, source.height));
  if (scale >= 1) return createImageBitmap(source);
  return createImageBitmap(source, {
    resizeWidth: Math.max(1, Math.round(source.width * scale)),
    resizeHeight: Math.max(1, Math.round(source.height * scale)),
    resizeQuality: "medium",
  });
};
