import type { TransformSnapshot } from "../../store/transform-store";
import { editorPathForPreset, type ShareableState } from "../../utils/preset-url";
import { encodeRecipe } from "../../utils/recipe-url";

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
