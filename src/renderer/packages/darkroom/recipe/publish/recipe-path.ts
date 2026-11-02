import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import { editorPathForPreset, type ShareableState } from "../../share/preset-url";
import { encodeRecipe } from "../../share/recipe-url";

export type RecipeBody = TransformSnapshot | ShareableState;

const isFullSnapshot = (body: RecipeBody): body is TransformSnapshot =>
  !("paletteId" in body);

export function editorPathForRecipe(body: RecipeBody): string {
  if (isFullSnapshot(body)) return `/editor?recipe=${encodeRecipe(body)}`;
  return editorPathForPreset(body);
}

export function recipeShareUrl(id: string): string {
  return `${window.location.origin}/r/${id}`;
}
