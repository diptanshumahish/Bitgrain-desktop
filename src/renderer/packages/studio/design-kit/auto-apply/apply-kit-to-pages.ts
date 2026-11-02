import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { mapPagesLayersDeep } from "../linking/map-layers-deep";
import { colorKey, isSolidColor, keepAlphaOf } from "../palette/kit-color-space";
import { layerColorUses, recolorLayer, type KitColorChoice } from "../palette/layer-colors";
import { flattenLayers } from "../palette/walk-layers";
import { buildKitColorMap, type KitColorMap } from "./map-template-colors";
import { buildKitTextMap, restyleTextLayer } from "./map-template-text";
import { swapLogoPlaceholders } from "./swap-logo-placeholders";

const collectColors = (pages: TemplatePage[]): string[] => [
  ...pages.map((page) => page.background).filter(isSolidColor),
  ...pages.flatMap((page) => flattenLayers(page.layers).flatMap((layer) => layerColorUses(layer).map((use) => use.value))),
];

const collectFontSizes = (pages: TemplatePage[]): number[] =>
  pages.flatMap((page) => flattenLayers(page.layers).flatMap((layer) => (layer.type === "text" ? [layer.fontSize] : [])));

type ColorPick = (value: string) => KitColorChoice | null;

const colorPicker = (map: KitColorMap): ColorPick => (value) => {
  const choice = map.get(colorKey(value));
  return choice ? { id: choice.id, value: keepAlphaOf(value, choice.value) } : null;
};

const recolorBackground = (page: TemplatePage, pick: ColorPick): TemplatePage => {
  const choice = isSolidColor(page.background) ? pick(page.background) : null;
  return choice ? { ...page, background: choice.value, backgroundVar: choice.id } : page;
};

export const applyKitToPages = (pages: TemplatePage[], kit: DesignKit): TemplatePage[] => {
  const pick = colorPicker(buildKitColorMap(collectColors(pages), kit.colors));
  const textMap = buildKitTextMap(collectFontSizes(pages), kit.textStyles);
  const restyled = mapPagesLayersDeep(pages, (layer) => restyleTextLayer(recolorLayer(layer, pick), textMap));
  return swapLogoPlaceholders(restyled.map((page) => recolorBackground(page, pick)), kit.logos ?? []);
};
