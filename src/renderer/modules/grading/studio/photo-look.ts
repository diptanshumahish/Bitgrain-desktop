import type { BitgrainEffect } from "../../../data/studioTypes";
import type { ColorGrade } from "../engine/grade-types";
import type { MaskLayer } from "../mask/mask-types";
import { isNeutralGrade } from "../engine/grade-checks";
import { activeMaskLayers } from "../mask/mask-defaults";

export interface PhotoLook {
  effect?: BitgrainEffect;
  grade?: ColorGrade;
  masks?: MaskLayer[];
}

export interface PhotoLookLayer {
  bitgrainEffect?: BitgrainEffect;
  colorGrade?: ColorGrade;
  masks?: MaskLayer[];
}

export const lookFromLayer = (layer: PhotoLookLayer): PhotoLook => ({
  effect: layer.bitgrainEffect,
  grade: layer.colorGrade,
  masks: layer.masks,
});

export const needsPixelPass = (look: PhotoLook): boolean =>
  !isNeutralGrade(look.grade) || activeMaskLayers(look.masks).length > 0;

export const hasPhotoLook = (look: PhotoLook): boolean => !!look.effect || needsPixelPass(look);

export const photoLookKey = (look: PhotoLook): string =>
  JSON.stringify({
    effect: look.effect ?? null,
    grade: isNeutralGrade(look.grade) ? null : look.grade,
    masks: activeMaskLayers(look.masks),
  });
