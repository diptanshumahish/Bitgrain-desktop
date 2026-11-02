import type { Layer } from "../model/studio-types";
import { findAncestorGroupIds } from "./studio-layers";

export const findParentGroupId = (layers: Layer[], id: string): string | null => {
  const ancestors = findAncestorGroupIds(layers, id);
  if (!ancestors || ancestors.length === 0) return null;
  return ancestors[ancestors.length - 1];
};
