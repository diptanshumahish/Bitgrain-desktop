import type { DesignFormat } from "./new-design-formats";

const VERTICAL_WIDTH = 1080;
const VERTICAL_HEIGHT = 1920;
const VERTICAL_DETAIL = "1080 × 1920 px";

export const VERTICAL_SIZES: DesignFormat[] = [
  {
    id: "story",
    label: "Story",
    detail: VERTICAL_DETAIL,
    width: VERTICAL_WIDTH,
    height: VERTICAL_HEIGHT,
    safeZones: [{ label: "Story safe area", x: 60, y: 250, width: 960, height: 1340 }],
  },
  {
    id: "reel-cover",
    label: "Reel cover",
    detail: VERTICAL_DETAIL,
    width: VERTICAL_WIDTH,
    height: VERTICAL_HEIGHT,
    safeZones: [
      { label: "Profile grid crop", x: 0, y: 240, width: 1080, height: 1440 },
      { label: "Clear of reel buttons", x: 60, y: 220, width: 840, height: 1320 },
    ],
  },
  {
    id: "tiktok-cover",
    label: "TikTok cover",
    detail: VERTICAL_DETAIL,
    width: VERTICAL_WIDTH,
    height: VERTICAL_HEIGHT,
    safeZones: [
      { label: "Profile grid crop", x: 0, y: 240, width: 1080, height: 1440 },
      { label: "Clear of TikTok buttons", x: 60, y: 130, width: 900, height: 1306 },
    ],
  },
  {
    id: "youtube-shorts-cover",
    label: "YouTube Shorts cover",
    detail: VERTICAL_DETAIL,
    width: VERTICAL_WIDTH,
    height: VERTICAL_HEIGHT,
    safeZones: [{ label: "Clear of Shorts buttons", x: 48, y: 230, width: 840, height: 1330 }],
  },
  {
    id: "snapchat-story",
    label: "Snapchat story",
    detail: VERTICAL_DETAIL,
    width: VERTICAL_WIDTH,
    height: VERTICAL_HEIGHT,
    safeZones: [{ label: "Snap safe area", x: 60, y: 150, width: 960, height: 1500 }],
  },
  {
    id: "phone-wallpaper",
    label: "Phone wallpaper",
    detail: "1170 × 2532 px",
    width: 1170,
    height: 2532,
    safeZones: [{ label: "Clear of clock and dock", x: 0, y: 760, width: 1170, height: 1420 }],
  },
];
