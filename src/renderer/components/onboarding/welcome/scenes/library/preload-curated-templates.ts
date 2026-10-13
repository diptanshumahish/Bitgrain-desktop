import { CURATED_TEMPLATES, curatedThumbnailUrl } from "./curated-templates";
import { POSTER_ORIGINAL_PHOTO, POSTER_THUMBNAIL } from "../editor/timeline/poster-template";
import { SWAPPED_PHOTO } from "../editor/timeline/editor-photos";

const EDITOR_IMAGES = [POSTER_ORIGINAL_PHOTO, POSTER_THUMBNAIL, SWAPPED_PHOTO];

export const preloadCuratedTemplates = (): void => {
  for (const source of [...CURATED_TEMPLATES.map(curatedThumbnailUrl), ...EDITOR_IMAGES]) {
    const image = new Image();
    image.decoding = "async";
    image.src = source;
  }
};
