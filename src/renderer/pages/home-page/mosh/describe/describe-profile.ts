import {
  BRIGHT_LUMA,
  DARK_LUMA,
  HIGH_DETAIL,
  LOW_DETAIL,
  MUTED_SATURATION,
  VIVID_SATURATION,
  type ImageProfile,
} from "../analysis/image-profile";

const lightWord = (profile: ImageProfile): string | null => {
  if (profile.meanLuma < DARK_LUMA) return "dark";
  if (profile.meanLuma > BRIGHT_LUMA) return "bright";
  return null;
};

const colorWord = (profile: ImageProfile): string | null => {
  if (profile.meanSaturation < MUTED_SATURATION) return "muted";
  if (profile.meanSaturation > VIVID_SATURATION) return "colorful";
  return null;
};

const detailWord = (profile: ImageProfile): string | null => {
  if (profile.detail > HIGH_DETAIL) return "detailed";
  if (profile.detail < LOW_DETAIL) return "soft";
  return null;
};

export const describeProfile = (profile: ImageProfile): string => {
  const words = [lightWord(profile), colorWord(profile), detailWord(profile)].filter(
    (word): word is string => word !== null,
  );
  if (words.length === 0) return "Tuned to your photo";
  return `Tuned for a ${words.join(", ")} photo`;
};
