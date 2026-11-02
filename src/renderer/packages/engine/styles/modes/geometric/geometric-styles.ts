import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { GEOMETRIC_LOOK_SETS } from "./geometric-looks";
import { LATTICE_STYLE } from "./lattice/lattice-style";
import { NEONGRID_STYLE } from "./neongrid/neon-style";
import { SPECIMEN_STYLE } from "./specimen/specimen-style";

export const GEOMETRIC_STYLES: readonly StyleDefinition[] = [
  SPECIMEN_STYLE, LATTICE_STYLE, NEONGRID_STYLE,
];

export const GEOMETRIC_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = GEOMETRIC_LOOK_SETS;
