import type { ExportFormat } from "../../engine/export/export-types";

export interface PlatformPreset {
  id: string;
  label: string;
  sub: string;
  width: number;
  height: number;
  format: ExportFormat;
}

// Exact platform sizes, center-cropped on export. Free plans get a watermarked, clamped version;
// paid plans get the exact dimensions clean.
export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "cover", label: "album cover", sub: "3000 square", width: 3000, height: 3000, format: "png" },
  { id: "canvas", label: "spotify canvas", sub: "1080 × 1920", width: 1080, height: 1920, format: "png" },
  { id: "square", label: "social square", sub: "1080 square", width: 1080, height: 1080, format: "png" },
  { id: "wide", label: "banner", sub: "1920 × 1080", width: 1920, height: 1080, format: "png" },
];
