import { currentTimeSignal } from "./timeline-store";
import { currentProjectSignal, updateProject } from "./project-store";
import type { VideoProject } from "../types";

const MARKER_EPSILON = 0.05;

export function projectMarkers(project: VideoProject | null): number[] {
  return project?.markers ?? [];
}

export function projectRangeIn(project: VideoProject | null): number | null {
  return project?.rangeIn ?? null;
}

export function projectRangeOut(project: VideoProject | null): number | null {
  return project?.rangeOut ?? null;
}

function isNear(value: number | null, time: number): boolean {
  return value !== null && Math.abs(value - time) < MARKER_EPSILON;
}

export function toggleMarkerAtPlayhead(): void {
  const time = currentTimeSignal.value;
  updateProject((project) => {
    const existing = projectMarkers(project);
    const near = existing.find((marker) => isNear(marker, time));
    const markers =
      near !== undefined
        ? existing.filter((marker) => marker !== near)
        : [...existing, time].sort((a, b) => a - b);
    return { ...project, markers };
  });
}

export function clearMarkers(): void {
  if (projectMarkers(currentProjectSignal.value).length === 0) return;
  updateProject((project) => ({ ...project, markers: [] }));
}

export function setRangeIn(): void {
  const time = currentTimeSignal.value;
  updateProject((project) => {
    if (isNear(projectRangeIn(project), time)) return { ...project, rangeIn: null };
    const rangeOut = projectRangeOut(project);
    return {
      ...project,
      rangeIn: time,
      rangeOut: rangeOut !== null && rangeOut <= time ? null : rangeOut,
    };
  });
}

export function setRangeOut(): void {
  const time = currentTimeSignal.value;
  updateProject((project) => {
    if (isNear(projectRangeOut(project), time)) return { ...project, rangeOut: null };
    const rangeIn = projectRangeIn(project);
    return {
      ...project,
      rangeOut: time,
      rangeIn: rangeIn !== null && rangeIn >= time ? null : rangeIn,
    };
  });
}
