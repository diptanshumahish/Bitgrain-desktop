import { currentProjectSignal } from "./project-store";
import { saveVideoProject } from "./video-projects-store";

const DEBOUNCE_MS = 1000;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastSavedAt = 0;

export function startAutosave(): () => void {
  return currentProjectSignal.subscribe(() => {
    const project = currentProjectSignal.value;
    if (!project) return;
    if (project.updatedAt === lastSavedAt) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const latest = currentProjectSignal.value;
      if (!latest) return;
      lastSavedAt = latest.updatedAt;
      saveVideoProject(latest).catch(() => {
        lastSavedAt = 0;
      });
    }, DEBOUNCE_MS);
  });
}
