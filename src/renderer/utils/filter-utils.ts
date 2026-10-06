import type { ImageFilters, LayerShadow } from "../data/studioTypes";

export const buildShadowFilter = (shadow?: LayerShadow): string | undefined => {
  if (!shadow || !shadow.enabled) return undefined;
  const offsetX = shadow.mode === "glow" ? 0 : shadow.x;
  const offsetY = shadow.mode === "glow" ? 0 : shadow.y;
  const drop = `drop-shadow(${offsetX}px ${offsetY}px ${shadow.blur}px ${shadow.color})`;
  return shadow.mode === "glow" ? `${drop} ${drop}` : drop;
};

export const composeLayerFilter = (
  filters?: ImageFilters,
  shadow?: LayerShadow,
): string | undefined => {
  const parts = [constructFilterString(filters), buildShadowFilter(shadow)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" ") : undefined;
};

export const constructFilterString = (filters?: ImageFilters): string | undefined => {
  if (!filters) return undefined;
  
  const parts: string[] = [];
  
  if (filters.brightness !== undefined) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== undefined) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturation !== undefined) parts.push(`saturate(${filters.saturation}%)`);
  if (filters.grayscale !== undefined) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia !== undefined) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.blur !== undefined) parts.push(`blur(${filters.blur}px)`);
  if (filters.hueRotate !== undefined) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.invert !== undefined) parts.push(`invert(${filters.invert}%)`);
  
  return parts.length > 0 ? parts.join(" ") : undefined;
};
