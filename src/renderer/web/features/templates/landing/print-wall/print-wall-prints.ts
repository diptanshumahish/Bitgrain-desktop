import { SHOWCASE_TEMPLATES, showcaseTemplateSrc } from "../../../landing/marketing/showcase-templates/showcase-templates";
import { rotateList } from "../../../landing/marketing/showcase-templates/rotate-templates";

export interface WallPrint {
  key: string;
  src: string;
  width: number;
  height: number;
}

export const POSTER_PRINTS: readonly WallPrint[] = SHOWCASE_TEMPLATES.map((template) => ({
  key: template.slug,
  src: showcaseTemplateSrc(template),
  width: template.width,
  height: template.height,
}));

export const shiftPrints = (prints: readonly WallPrint[], offset: number): WallPrint[] => rotateList(prints, offset);
