import type { TransformSnapshot } from "../../../../store/transform-store";
import type { ImageProfile } from "../analysis/image-profile";
import type { MoshResult } from "../feedback/mosh-result-events";
import { describeProfile } from "./describe-profile";
import { DITHER_NAMES, HALFTONE_STYLE_NAMES, MODE_NAMES } from "./effect-names";

const toneWord = (snap: TransformSnapshot): string => (snap.isColor ? "full color" : "black and white");

const titleFor = (snap: TransformSnapshot): string => {
  const mode = snap.modes[0];
  if (mode === "dither") return `${DITHER_NAMES[snap.ditherMethod]} dither`;
  if (mode === "halftone") return `${HALFTONE_STYLE_NAMES[snap.halftoneStyle]} halftone`;
  return MODE_NAMES[mode] ?? "New look";
};

const detailFor = (snap: TransformSnapshot): string => {
  const mode = snap.modes[0];
  if (mode === "dither" && snap.palette) return `${snap.palette.name} palette`;
  if (mode === "halftone") return `${snap.halftoneCell}px ${snap.halftoneShape} dots`;
  if (mode === "popart") return `${snap.popartCell}px cells, ${toneWord(snap)}`;
  if (mode === "manga") return `${snap.mangaCell}px hatching`;
  if (mode === "contour") return `${snap.contourLevels} levels${snap.contourFill ? ", filled" : ""}`;
  return toneWord(snap);
};

export const describeMoshResult = (snap: TransformSnapshot, profile: ImageProfile): MoshResult => ({
  title: titleFor(snap),
  detail: detailFor(snap),
  reason: describeProfile(profile),
});
