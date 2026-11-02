export type VideoResolution = "720p" | "1080p" | "4k";

export interface PlanLimits {
  watermark: boolean;
  maxExportLongEdge: number | null;
  allowSvgExport: boolean;
  allowVideoExport: boolean;
  videoMaxResolution: VideoResolution;
  videoMaxLengthSeconds: number | null;
  allowBatch: boolean;
  cloudProjectLimit: number;
  cloudVersionHistory: boolean;
  maxImageProjects: number;
  maxVideoProjects: number;
  allowMultiFormatResize: boolean;
  allowBrandKitPro: boolean;
  allowSoundLoopExport: boolean;
}

const FREE_MAX_LONG_EDGE = 1080;
const UNLIMITED_PROJECTS = Number.POSITIVE_INFINITY;
export const FREE_CLOUD_PROJECT_LIMIT = 3;
export const MCP_MONTHLY_RENDER_ALLOWANCE = 300;
export const MCP_RENDER_PACK_SIZE = 250;
export const EXPORT_PACK_SIZE = 3;

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    watermark: true,
    maxExportLongEdge: FREE_MAX_LONG_EDGE,
    allowSvgExport: false,
    allowVideoExport: true,
    videoMaxResolution: "720p",
    videoMaxLengthSeconds: null,
    allowBatch: false,
    cloudProjectLimit: FREE_CLOUD_PROJECT_LIMIT,
    cloudVersionHistory: false,
    maxImageProjects: UNLIMITED_PROJECTS,
    maxVideoProjects: UNLIMITED_PROJECTS,
    allowMultiFormatResize: false,
    allowBrandKitPro: false,
    allowSoundLoopExport: false,
  },
  pro: {
    watermark: false,
    maxExportLongEdge: null,
    allowSvgExport: true,
    allowVideoExport: true,
    videoMaxResolution: "4k",
    videoMaxLengthSeconds: null,
    allowBatch: true,
    cloudProjectLimit: UNLIMITED_PROJECTS,
    cloudVersionHistory: true,
    maxImageProjects: UNLIMITED_PROJECTS,
    maxVideoProjects: UNLIMITED_PROJECTS,
    allowMultiFormatResize: true,
    allowBrandKitPro: true,
    allowSoundLoopExport: true,
  },
};

const LEGACY_PLAN_ALIASES: Record<string, string> = {
  studio: "pro",
  "studio-pro": "pro",
  "pro-license-10yr": "pro",
  "pro-monthly": "pro",
  creator: "pro",
  "creator-monthly": "pro",
  "creator-yearly": "pro",
};

const resolvePlanId = (plan: string | null | undefined): string => {
  if (!plan) return "free";
  return LEGACY_PLAN_ALIASES[plan] ?? plan;
};

export const getPlanLimits = (plan: string | null | undefined): PlanLimits => {
  return PLAN_LIMITS[resolvePlanId(plan)] ?? PLAN_LIMITS.free;
};
