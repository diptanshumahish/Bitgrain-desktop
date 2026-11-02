import type { DesignFormat } from "./new-design-formats";

export const BANNER_SIZES: DesignFormat[] = [
  {
    id: "linkedin-banner",
    label: "LinkedIn banner",
    detail: "1584 × 396 px",
    width: 1584,
    height: 396,
    safeZones: [{ label: "Clear of profile photo", x: 480, y: 40, width: 1044, height: 316 }],
  },
  {
    id: "linkedin-company-cover",
    label: "LinkedIn company cover",
    detail: "1128 × 191 px",
    width: 1128,
    height: 191,
    safeZones: [{ label: "Mobile crop", x: 140, y: 0, width: 848, height: 191 }],
  },
  {
    id: "twitter-header",
    label: "X / Twitter header",
    detail: "1500 × 500 px",
    width: 1500,
    height: 500,
    safeZones: [
      { label: "Mobile crop", x: 0, y: 60, width: 1500, height: 380 },
      { label: "Clear of profile photo", x: 340, y: 60, width: 1120, height: 380 },
    ],
  },
  {
    id: "youtube-banner",
    label: "YouTube channel banner",
    detail: "2560 × 1440 px",
    width: 2560,
    height: 1440,
    safeZones: [
      { label: "Desktop", x: 0, y: 508, width: 2560, height: 423 },
      { label: "Safe on every device", x: 507, y: 508, width: 1546, height: 423 },
    ],
  },
  {
    id: "facebook-cover",
    label: "Facebook cover",
    detail: "1640 × 624 px",
    width: 1640,
    height: 624,
    safeZones: [{ label: "Mobile crop", x: 205, y: 0, width: 1230, height: 624 }],
  },
  { id: "facebook-event-cover", label: "Facebook event cover", detail: "1920 × 1005 px", width: 1920, height: 1005 },
  {
    id: "twitch-banner",
    label: "Twitch banner",
    detail: "1200 × 480 px",
    width: 1200,
    height: 480,
    safeZones: [{ label: "Safe area", x: 100, y: 60, width: 1000, height: 360 }],
  },
  { id: "discord-banner", label: "Discord server banner", detail: "960 × 540 px", width: 960, height: 540 },
  { id: "email-header", label: "Email header", detail: "600 × 200 px", width: 600, height: 200 },
  { id: "open-graph", label: "Link preview image", detail: "1200 × 630 px", width: 1200, height: 630 },
];
