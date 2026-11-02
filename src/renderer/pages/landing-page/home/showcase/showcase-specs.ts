import { ENGINE_SOURCES } from "../../../../components/marketing/marketing-images";
import { engineSpec } from "./engine-spec";

export const HILL_SPEC = engineSpec(ENGINE_SOURCES.hillTree, {
  isColor: false,
  contrast: 1.7,
  brightness: 1.25,
  halftoneCell: 6,
  halftoneAngle: 45,
});

export const READER_SPEC = engineSpec(ENGINE_SOURCES.engraving, {
  mode: ["crosshatch"],
  isColor: false,
  contrast: 1.35,
  brightness: 1.1,
});

export const RED_DRESS_SPEC = engineSpec(ENGINE_SOURCES.redDress, {
  halftoneStyle: "cmyk",
  halftoneCell: 3,
  contrast: 1.15,
  saturation: 1.2,
});
