import type { DesignFormat } from "./new-design-formats";

export const SOCIAL_POST_SIZES: DesignFormat[] = [
  { id: "instagram-post", label: "Instagram post", detail: "1080 × 1080 px", width: 1080, height: 1080 },
  {
    id: "instagram-portrait",
    label: "Instagram portrait",
    detail: "1080 × 1350 px",
    width: 1080,
    height: 1350,
    safeZones: [{ label: "Profile grid crop", x: 34, y: 0, width: 1012, height: 1350 }],
  },
  { id: "instagram-carousel", label: "Instagram carousel", detail: "1080 × 1350 px, per slide", width: 1080, height: 1350 },
  { id: "facebook-post", label: "Facebook post", detail: "1200 × 630 px", width: 1200, height: 630 },
  { id: "linkedin-post", label: "LinkedIn post", detail: "1200 × 627 px", width: 1200, height: 627 },
  { id: "linkedin-square", label: "LinkedIn square post", detail: "1200 × 1200 px", width: 1200, height: 1200 },
  { id: "linkedin-portrait", label: "LinkedIn portrait post", detail: "1080 × 1350 px", width: 1080, height: 1350 },
  { id: "twitter-post", label: "X / Twitter post", detail: "1600 × 900 px", width: 1600, height: 900 },
  { id: "threads-post", label: "Threads post", detail: "1080 × 1350 px", width: 1080, height: 1350 },
  { id: "pinterest-pin", label: "Pinterest pin", detail: "1000 × 1500 px", width: 1000, height: 1500 },
  { id: "bluesky-post", label: "Bluesky post", detail: "1200 × 675 px", width: 1200, height: 675 },
];
