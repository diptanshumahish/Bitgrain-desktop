import type { RichRender } from "./rich-types";

export const richOwnsOpacity = (rich: RichRender): boolean => rich.backgroundBlur > 0;
