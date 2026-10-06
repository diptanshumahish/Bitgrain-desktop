import type { VideoProject } from "../../../types";

export interface ExportRange {
  start: number;
  end: number;
}

export function resolveExportRange(project: VideoProject): ExportRange {
  const full: ExportRange = { start: 0, end: project.duration };
  const start = Math.min(Math.max(0, project.rangeIn ?? 0), project.duration);
  const end = Math.min(project.rangeOut ?? project.duration, project.duration);
  if (end - start <= 0) return full;
  return { start, end };
}

export function rangeDuration(range: ExportRange): number {
  return range.end - range.start;
}
