import type { DesignFormat } from "../design-sizes/new-design-formats";
import { pickSizes } from "../design-sizes/size-groups";
import { MUSIC_FORMATS } from "./music-formats";

export interface ResizeFormatGroup {
  id: string;
  label: string;
  formats: DesignFormat[];
}

const SOCIAL_FORMAT_IDS = [
  "instagram-post",
  "instagram-portrait",
  "story",
  "twitter-post",
  "twitter-header",
  "linkedin-square",
  "linkedin-banner",
  "pinterest-pin",
  "facebook-cover",
];

const VIDEO_FORMAT_IDS = ["youtube-thumbnail", "video-1080p", "tiktok-cover"];

const MUSIC_SIZE_IDS = ["album-cover"];

const PRINT_FORMAT_IDS = ["a4", "a3", "us-letter", "postcard"];

export const RESIZE_FORMAT_GROUPS: ResizeFormatGroup[] = [
  { id: "social", label: "Social", formats: pickSizes(SOCIAL_FORMAT_IDS) },
  { id: "video", label: "Video", formats: pickSizes(VIDEO_FORMAT_IDS) },
  { id: "music", label: "Music", formats: [...pickSizes(MUSIC_SIZE_IDS), ...MUSIC_FORMATS] },
  { id: "print", label: "Print", formats: pickSizes(PRINT_FORMAT_IDS) },
];

export const RESIZE_FORMATS: DesignFormat[] = RESIZE_FORMAT_GROUPS.flatMap((group) => group.formats);
