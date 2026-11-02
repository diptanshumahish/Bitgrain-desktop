import type { StyleLook } from "../../../engine/style-types";
import { bloom } from "../../../looks/look-builders";

const DUST_BLOOM = 34;
const DUST_CONTRAST = 40;

const dustLook = (name: string, colours: string): StyleLook => ({
  name, params: { colours, contrast: DUST_CONTRAST }, effects: bloom(DUST_BLOOM),
});

export const DREAMDUST_LOOKS: readonly StyleLook[] = [
  dustLook("Stardust", "source"),
  dustLook("Moonlight", "moonlight"),
  dustLook("Rose", "rose"),
  dustLook("Amber", "amber"),
  dustLook("Mint", "mint"),
  dustLook("Violet", "violet"),
  { name: "Drifting", params: { colours: "mono", drift: 55, swirl: 60, density: 70 }, effects: bloom(DUST_BLOOM) },
];

