import { computeImageProfile } from "./compute-image-profile";
import { NEUTRAL_PROFILE, type ImageProfile } from "./image-profile";
import { sampleImagePixels } from "./sample-image-pixels";

const profileCache = new Map<string, ImageProfile>();

export const getImageProfile = async (url: string | null): Promise<ImageProfile> => {
  if (!url) return NEUTRAL_PROFILE;
  const cached = profileCache.get(url);
  if (cached) return cached;
  try {
    const profile = computeImageProfile(await sampleImagePixels(url));
    profileCache.set(url, profile);
    return profile;
  } catch (err) {
    console.error("randomize image analysis failed, using neutral profile:", err);
    return NEUTRAL_PROFILE;
  }
};
