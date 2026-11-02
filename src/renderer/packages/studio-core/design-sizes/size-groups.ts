import type { DesignFormat } from "./new-design-formats";
import { SOCIAL_POST_SIZES } from "./social-sizes";
import { VERTICAL_SIZES } from "./vertical-sizes";
import { BANNER_SIZES } from "./banner-sizes";
import { VIDEO_SIZES } from "./video-sizes";
import { PRINT_SIZES } from "./print-sizes";
import { SCREEN_SIZES } from "./screen-sizes";

export interface SizeGroup {
  id: string;
  label: string;
  formats: DesignFormat[];
}

export const SIZE_GROUPS: SizeGroup[] = [
  { id: "social", label: "Social posts", formats: SOCIAL_POST_SIZES },
  { id: "vertical", label: "Stories, reels and covers", formats: VERTICAL_SIZES },
  { id: "banners", label: "Banners and headers", formats: BANNER_SIZES },
  { id: "video", label: "Video and audio", formats: VIDEO_SIZES },
  { id: "print", label: "Print", formats: PRINT_SIZES },
  { id: "screen", label: "Slides and screens", formats: SCREEN_SIZES },
];

const ALL_SIZES: DesignFormat[] = SIZE_GROUPS.flatMap((group) => group.formats);

const FEATURED_SIZE_IDS = [
  "instagram-post",
  "instagram-portrait",
  "story",
  "linkedin-banner",
  "youtube-thumbnail",
  "presentation",
];

export function pickSizes(ids: string[]): DesignFormat[] {
  return ids.flatMap((id) => ALL_SIZES.filter((format) => format.id === id));
}

export const FEATURED_SIZES: DesignFormat[] = pickSizes(FEATURED_SIZE_IDS);
