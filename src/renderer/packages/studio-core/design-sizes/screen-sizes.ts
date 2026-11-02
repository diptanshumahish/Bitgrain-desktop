import type { DesignFormat } from "./new-design-formats";

export const SCREEN_SIZES: DesignFormat[] = [
  { id: "presentation", label: "Presentation", detail: "1920 × 1080 px", width: 1920, height: 1080 },
  { id: "presentation-4x3", label: "Presentation 4:3", detail: "1024 × 768 px", width: 1024, height: 768 },
  { id: "desktop-wallpaper", label: "Desktop wallpaper", detail: "2560 × 1440 px", width: 2560, height: 1440 },
  { id: "web-hero", label: "Website hero", detail: "1920 × 1080 px", width: 1920, height: 1080 },
  { id: "blog-banner", label: "Blog banner", detail: "1200 × 600 px", width: 1200, height: 600 },
];
