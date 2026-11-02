import type { ExportFormat } from "@bitgrain/engine/export/export-types";

export interface PlatformPreset {
  id: string;
  label: string;
  sub: string;
  width: number;
  height: number;
  format: ExportFormat;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "cover", label: "Album cover", sub: "3000 square", width: 3000, height: 3000, format: "png" },
  { id: "canvas", label: "Spotify canvas", sub: "1080 × 1920", width: 1080, height: 1920, format: "png" },
  { id: "square", label: "Social square", sub: "1080 square", width: 1080, height: 1080, format: "png" },
  { id: "wide", label: "Banner", sub: "1920 × 1080", width: 1920, height: 1080, format: "png" },
];
