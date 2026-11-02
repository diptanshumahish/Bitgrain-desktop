import type { DesignFormat } from "./new-design-formats";

export const VIDEO_SIZES: DesignFormat[] = [
  {
    id: "youtube-thumbnail",
    label: "YouTube thumbnail",
    detail: "1280 × 720 px",
    width: 1280,
    height: 720,
    safeZones: [{ label: "Clear of timestamp", x: 0, y: 0, width: 1110, height: 720 }],
  },
  {
    id: "video-1080p",
    label: "Video 1080p",
    detail: "1920 × 1080 px",
    width: 1920,
    height: 1080,
    safeZones: [
      { label: "Action safe", x: 96, y: 54, width: 1728, height: 972 },
      { label: "Title safe", x: 192, y: 108, width: 1536, height: 864 },
    ],
  },
  { id: "video-4k", label: "Video 4K", detail: "3840 × 2160 px", width: 3840, height: 2160 },
  { id: "podcast-cover", label: "Podcast cover", detail: "3000 × 3000 px", width: 3000, height: 3000 },
  { id: "album-cover", label: "Album cover", detail: "3000 × 3000 px", width: 3000, height: 3000 },
];
