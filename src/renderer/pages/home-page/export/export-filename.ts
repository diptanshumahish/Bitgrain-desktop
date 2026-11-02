import { imageMetaSignal } from "../../../store/image-store";
import { modesSignal, lutIdSignal } from "../../../store/transform-store";
import { currentEffectLabel } from "../../../components/toolbar/effects/current-effect-label";

const FALLBACK_NAME = "bitgrain";
const GRADE_LABEL = "film";
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
  return slugify(currentEffectLabel(modesSignal.value));
};

export const currentExportBaseName = (): string => `${originalName()}-${effectName()}`;
