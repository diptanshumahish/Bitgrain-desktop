import { signal } from "../../../lib/signal";
import {
  currentProjectSignal,
  setCurrentProject,
} from "./project-store";
import type { VideoProject } from "../types";

const MAX_HISTORY = 60;

export const canUndoSignal = signal(false);
export const canRedoSignal = signal(false);

const undoStack: VideoProject[] = [];
const redoStack: VideoProject[] = [];

let lastSnapshotJson: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function snapshot(project: VideoProject): VideoProject {
  return JSON.parse(JSON.stringify(project)) as VideoProject;
}

function refreshFlags(): void {
  canUndoSignal.value = undoStack.length > 0;
  canRedoSignal.value = redoStack.length > 0;
}

function pushNow(): void {
  const project = currentProjectSignal.value;
  if (!project) return;
  const json = JSON.stringify(project);
  if (json === lastSnapshotJson) return;
  lastSnapshotJson = json;
  undoStack.push(snapshot(project));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  refreshFlags();
}

function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 400);
}

export function startHistoryRecorder(): () => void {
  lastSnapshotJson = null;
  undoStack.length = 0;
  redoStack.length = 0;
  refreshFlags();
  // seed initial state
  pushNow();
  return currentProjectSignal.subscribe(schedulePush);
}

export function undo(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
    pushNow();
  }
  if (undoStack.length <= 1) return;
  const current = undoStack.pop();
  if (current) redoStack.push(current);
  const previous = undoStack[undoStack.length - 1];
  if (!previous) return;
  lastSnapshotJson = JSON.stringify(previous);
  setCurrentProject(snapshot(previous));
  refreshFlags();
}

export function redo(): void {
  const next = redoStack.pop();
  if (!next) return;
  undoStack.push(next);
  lastSnapshotJson = JSON.stringify(next);
  setCurrentProject(snapshot(next));
  refreshFlags();
}
