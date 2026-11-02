import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { FLUTED_GLASS_STYLE } from "./fluted/fluted-style";
import { FROSTED_GLASS_STYLE } from "./frosted/frosted-style";
import { FLUTED_LOOKS, FROSTED_LOOKS } from "./looks/pane-looks";

export const GLASS_STYLES: readonly StyleDefinition[] = [FROSTED_GLASS_STYLE, FLUTED_GLASS_STYLE];

export const GLASS_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  [FROSTED_GLASS_STYLE.id]: FROSTED_LOOKS,
  [FLUTED_GLASS_STYLE.id]: FLUTED_LOOKS,
};
