import type { StyleLook } from "../../engine/style-types";
import { bloom, combine, grain, mono, vignette } from "../../looks/look-builders";

const SPECIMEN_LOOKS: readonly StyleLook[] = [
  { name: "Field notes", effects: grain(16) },
  { name: "Lab white", params: { ink: "#f4f4f4", count: 8, connectors: 50 }, effects: combine(mono(), grain(18)) },
  { name: "Signal red", params: { ink: "#ff4d3a", blur: 6, radius: 0 }, effects: vignette(30) },
];

const LATTICE_LOOKS: readonly StyleLook[] = [
  { name: "Glow mesh", effects: bloom(28) },
  { name: "Wireframe", params: { colour: "mono", glow: 30, connections: "ortho" }, effects: vignette(30) },
  { name: "Vivid", params: { colour: "vivid", resolution: 85, threshold: 45 }, effects: bloom(34) },
];

const NEONGRID_LOOKS: readonly StyleLook[] = [
  { name: "Neon", params: { contrast: 126 }, effects: combine(bloom(36), vignette(40)) },
  { name: "Hot pink", params: { colour: "#ff3cac", contrast: 110 }, effects: combine(bloom(30), vignette(40)) },
  { name: "Arcade lime", params: { colour: "#b6ff3c", gridScale: 30, warp: 50 }, effects: vignette(36) },
];

export const GEOMETRIC_LOOK_SETS: Readonly<Record<string, readonly StyleLook[]>> = {
  specimen: SPECIMEN_LOOKS,
  lattice: LATTICE_LOOKS,
  neongrid: NEONGRID_LOOKS,
};
