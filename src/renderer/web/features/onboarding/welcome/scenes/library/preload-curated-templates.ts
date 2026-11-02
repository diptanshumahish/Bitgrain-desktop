import { SHOWCASE_TEMPLATES, showcaseTemplateSrc } from "../../../../landing/marketing/showcase-templates/showcase-templates";
import { PHOTO_OPTIONS } from "../editor/timeline/editor-photos";

const EDITOR_IMAGES = PHOTO_OPTIONS.map((option) => option.src);

export const preloadCuratedTemplates = (): void => {
  for (const source of [...SHOWCASE_TEMPLATES.map(showcaseTemplateSrc), ...EDITOR_IMAGES]) {
    const image = new Image();
    image.decoding = "async";
    image.src = source;
  }
};
