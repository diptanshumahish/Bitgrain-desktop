import type { TemplatePage } from "../../../model/studio-types";

export type PreflightLevel = "pass" | "info" | "warn" | "fail";

export interface PreflightItem {
  id: string;
  level: PreflightLevel;
  message: string;
}

export interface PreflightInput {
  pages: TemplatePage[];
  fallbackImage: string | null;
  paperName: string | null;
}
