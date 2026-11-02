import { SHOWCASE_TEMPLATES, type ShowcaseTemplate } from "../../../../landing/marketing/showcase-templates/showcase-templates";
import { rotateList } from "../../../../landing/marketing/showcase-templates/rotate-templates";

const ROW_OFFSETS = [0, 4, 8];

export const LIBRARY_ROWS: ShowcaseTemplate[][] = ROW_OFFSETS.map((offset) => rotateList(SHOWCASE_TEMPLATES, offset));
