import { imageMetaSignal } from "../../state/image-store";
import { modesSignal, lutIdSignal, paletteSignal } from "../../state/transform-store";
import { RISO_PALETTE_ID } from "@bitgrain/engine/utils/ink-misregister";
import { currentEffectLabel } from "../../toolbar/effects/current-effect-label";
import { hasAppliedLook } from "./plain-conversion/has-applied-look";

const FALLBACK_NAME = "bitgrain";
const GRADE_LABEL = "film";
const RISO_LABEL = "riso";
const MAX_NAME_LENGTH = 60;

const slugify = (value: string): string =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_NAME_LENGTH);

const originalName = (): string => {
  const name = imageMetaSignal.value?.name ?? "";
  const base = name.split("/").pop() ?? "";
  return slugify(base) || FALLBACK_NAME;
};

const effectName = (): string => {
  if (lutIdSignal.value) return GRADE_LABEL;
  if (paletteSignal.value?.id === RISO_PALETTE_ID) return RISO_LABEL;
  return slugify(currentEffectLabel(modesSignal.value));
};

export const currentExportBaseName = (): string =>
  hasAppliedLook() ? `${originalName()}-${effectName()}` : originalName();
