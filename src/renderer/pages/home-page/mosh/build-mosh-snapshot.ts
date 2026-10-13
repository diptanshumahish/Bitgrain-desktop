import type { TransformSnapshot } from "../../../store/transform-store";
import type { ImageProfile } from "./analysis/image-profile";
import type { MoshRecipe } from "./mosh-recipes";
import { pickMoodPalette } from "./pick-mood-palette";
import { tuneDetail } from "./tune-detail";
import { tuneTone } from "./tune-tone";

const effectFields = (recipe: MoshRecipe, snap: TransformSnapshot): Partial<TransformSnapshot> => ({
  asciiCharset: recipe.asciiCharset ?? snap.asciiCharset,
  asciiTone: recipe.asciiTone ?? snap.asciiTone,
  asciiEdges: recipe.asciiEdges ?? false,
  asciiEdgeThreshold: recipe.asciiEdgeThreshold ?? snap.asciiEdgeThreshold,
  halftoneAngle: recipe.halftoneAngle ?? snap.halftoneAngle,
  halftoneStyle: recipe.halftoneStyle ?? snap.halftoneStyle,
  halftoneShape: recipe.halftoneShape ?? snap.halftoneShape,
  popartThreshold: recipe.popartThreshold ?? snap.popartThreshold,
  contourLevels: recipe.contourLevels ?? snap.contourLevels,
  contourFill: recipe.contourFill ?? snap.contourFill,
  mangaAngle: recipe.mangaAngle ?? snap.mangaAngle,
});

export const buildMoshSnapshot = (
  recipe: MoshRecipe,
  profile: ImageProfile,
  snap: TransformSnapshot,
): TransformSnapshot => {
  const detail = tuneDetail(recipe, profile);
  return {
    ...snap,
    ...effectFields(recipe, snap),
    ...tuneTone(recipe, profile),
    modes: recipe.modes,
    ditherMethod: recipe.ditherMethod,
    ditherFactor: detail.ditherFactor,
    resolution: detail.resolution,
    grain: recipe.grain,
    isColor: recipe.isColor,
    palette: recipe.usesPalette ? pickMoodPalette(profile, snap.palette?.id ?? null) : null,
    lutId: null,
    asciiDensity: detail.asciiDensity ?? snap.asciiDensity,
    halftoneCell: detail.cell,
    popartCell: detail.cell,
    mangaCell: detail.cell,
  };
};
