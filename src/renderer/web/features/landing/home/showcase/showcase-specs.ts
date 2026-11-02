import { ENGINE_SOURCES } from "../../marketing/marketing-images";
import { engineSpec } from "./engine-spec";

export const RED_DRESS_SPEC = engineSpec(ENGINE_SOURCES.redDress, {
  halftoneStyle: "cmyk",
  halftoneCell: 3,
  contrast: 1.15,
  saturation: 1.2,
});
