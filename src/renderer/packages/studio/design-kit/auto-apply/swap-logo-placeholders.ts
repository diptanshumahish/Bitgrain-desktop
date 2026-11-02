import type { ImageLayer, Layer, TemplatePage, UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import type { KitLogo, KitLogoRole } from "@bitgrain/studio-core/model/design-kit-types";
import { mapPagesLayersDeep } from "../linking/map-layers-deep";
import { isSolidColor, toOklab } from "../palette/kit-color-space";

const LOGO_NAME = /logo/i;
const MARK_NAME = /\b(mark|icon|symbol|monogram)\b/i;
const DARK_BACKGROUND_LIGHTNESS = 0.5;

const isLogoPlaceholder = (layer: Layer): layer is ImageLayer | UploadLayer =>
  (layer.type === "image" || layer.type === "upload") && LOGO_NAME.test(layer.name);

const isDarkBackground = (background: string): boolean =>
  isSolidColor(background) && toOklab(background).lightness < DARK_BACKGROUND_LIGHTNESS;

const pickLogo = (layerName: string, darkBackground: boolean, logos: KitLogo[]): KitLogo | null => {
  const withRole = (role: KitLogoRole): KitLogo | undefined => logos.find((logo) => logo.role === role);
  const mark = MARK_NAME.test(layerName) ? withRole("mark") : undefined;
  const onDark = darkBackground ? withRole("onDark") : undefined;
  return mark ?? onDark ?? withRole("primary") ?? logos[0] ?? null;
};

const swapInPage = (page: TemplatePage, logos: KitLogo[]): TemplatePage => {
  const darkBackground = isDarkBackground(page.background);
  const [swapped] = mapPagesLayersDeep([page], (layer) => {
    if (!isLogoPlaceholder(layer)) return layer;
    const logo = pickLogo(layer.name, darkBackground, logos);
    return logo ? { ...layer, src: logo.src, fit: "contain", crop: undefined } : layer;
  });
  return swapped;
};

export const swapLogoPlaceholders = (pages: TemplatePage[], logos: KitLogo[]): TemplatePage[] =>
  logos.length === 0 ? pages : pages.map((page) => swapInPage(page, logos));
