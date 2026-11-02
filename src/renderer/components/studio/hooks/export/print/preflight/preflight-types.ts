import type { TemplatePage } from "../../../../../../data/studioTypes";

export type PreflightLevel = "pass" | "info" | "warn" | "fail";

export interface PreflightItem {
  id: string;
  level: PreflightLevel;
  message: string;
}

export interface PreflightInput {
  pages: TemplatePage[];
  fallbackImage: string | null;
}
