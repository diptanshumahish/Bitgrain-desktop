import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";

interface CachedCover {
  template: TemplateDef;
  thumbnail: Promise<string | null>;
}

const coverThumbnails = new WeakMap<TemplatePage, CachedCover>();

export const cachedCoverThumbnail = (
  cover: TemplatePage,
  template: TemplateDef,
  render: () => Promise<string | null>,
): Promise<string | null> => {
  const cached = coverThumbnails.get(cover);
  if (cached && cached.template === template) return cached.thumbnail;
  const thumbnail = render();
  coverThumbnails.set(cover, { template, thumbnail });
  return thumbnail;
};
