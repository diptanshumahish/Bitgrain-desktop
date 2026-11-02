import type { TransformMode } from "../../types";

export type VectorKind = "halftone" | "ascii";

export const VECTOR_UNAVAILABLE_HINT = "Only halftone and ASCII looks export as true vectors. Use PNG for this look.";

export const vectorKindFor = (modes: TransformMode[], lutId: string | null): VectorKind | null => {
  if (lutId) return null;
  const lastMode = modes[modes.length - 1];
  if (lastMode === "halftone") return "halftone";
  if (lastMode === "ascii") return "ascii";
  return null;
};
