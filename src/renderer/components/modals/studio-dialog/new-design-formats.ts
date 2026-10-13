export interface DesignFormat {
  id: string;
  label: string;
  detail: string;
  width: number;
  height: number;
}

export interface DesignSize {
  width: number;
  height: number;
}

export const MIN_CUSTOM_SIDE_PX = 50;
export const MAX_CUSTOM_SIDE_PX = 8000;
export const DEFAULT_CUSTOM_SIZE: DesignSize = { width: 1200, height: 800 };

export const DESIGN_FORMATS: DesignFormat[] = [
  { id: "instagram-post", label: "Instagram post", detail: "1080 × 1080 px", width: 1080, height: 1080 },
  { id: "instagram-portrait", label: "Instagram portrait", detail: "1080 × 1350 px", width: 1080, height: 1350 },
  { id: "story", label: "Story", detail: "1080 × 1920 px", width: 1080, height: 1920 },
  { id: "presentation", label: "Presentation", detail: "1920 × 1080 px", width: 1920, height: 1080 },
  { id: "a4", label: "A4", detail: "210 × 297 mm at 300 dpi", width: 2480, height: 3508 },
  { id: "us-letter", label: "US Letter", detail: "8.5 × 11 in at 300 dpi", width: 2550, height: 3300 },
];

export function clampCustomSide(value: number): number {
  if (!Number.isFinite(value)) return MIN_CUSTOM_SIDE_PX;
  return Math.round(Math.min(MAX_CUSTOM_SIDE_PX, Math.max(MIN_CUSTOM_SIDE_PX, value)));
}
