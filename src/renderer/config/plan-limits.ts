export type VideoResolution = "720p" | "1080p" | "4k";

export interface PlanLimits {
  watermark: boolean;
  maxExportLongEdge: number | null;
  allowSvgExport: boolean;
  allowVideoExport: boolean;
  videoMaxResolution: VideoResolution;
  videoMaxLengthSeconds: number | null;
  allowBatch: boolean;
  cloudSync: boolean;
  maxImageProjects: number;
  maxVideoProjects: number;
}

const FREE_MAX_LONG_EDGE = 1500;
const UNLIMITED_PROJECTS = Number.POSITIVE_INFINITY;

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    watermark: true,
    maxExportLongEdge: FREE_MAX_LONG_EDGE,
    allowSvgExport: false,
    allowVideoExport: true,
    videoMaxResolution: "720p",
    videoMaxLengthSeconds: null,
    allowBatch: false,
    cloudSync: false,
    maxImageProjects: UNLIMITED_PROJECTS,
    maxVideoProjects: UNLIMITED_PROJECTS,
  },
  pro: {
    watermark: false,
    maxExportLongEdge: null,
    allowSvgExport: true,
    allowVideoExport: true,
    videoMaxResolution: "4k",
    videoMaxLengthSeconds: null,
    allowBatch: true,
    cloudSync: true,
    maxImageProjects: UNLIMITED_PROJECTS,
    maxVideoProjects: UNLIMITED_PROJECTS,
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

export const resolvePlanId = (plan: string | null | undefined): string => {
  if (!plan) return "free";
  return LEGACY_PLAN_ALIASES[plan] ?? plan;
};

export const getPlanLimits = (plan: string | null | undefined): PlanLimits => {
  return PLAN_LIMITS[resolvePlanId(plan)] ?? PLAN_LIMITS.free;
};
