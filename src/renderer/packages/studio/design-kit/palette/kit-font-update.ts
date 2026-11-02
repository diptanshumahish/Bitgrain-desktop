import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { refitTextLayer } from "../../layers/text-box/text-box-fit";

export const withKitFont = (layer: TextLayer, style: TextStyleVariable): Layer => {
  const update: Partial<TextLayer> = {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
  };
  return { ...layer, ...refitTextLayer(layer, update) };
};
