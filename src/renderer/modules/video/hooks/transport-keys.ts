import { setCurrentTime, currentTimeSignal } from "../store/timeline-store";
import { currentProjectSignal } from "../store/project-store";
import { DEFAULT_PROJECT_FPS } from "../constants";

const ONE_FRAME = 1;

function stepFrames(frames: number): void {
  const fps = currentProjectSignal.value?.fps ?? DEFAULT_PROJECT_FPS;
  setCurrentTime(currentTimeSignal.value + frames / fps);
}

export function handleTransportKey(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  switch (event.code) {
    case "Home":
      setCurrentTime(0);
      return true;
    case "End":
      setCurrentTime(currentProjectSignal.value?.duration ?? 0);
      return true;
    case "Comma":
      stepFrames(-ONE_FRAME);
      return true;
    case "Period":
      stepFrames(ONE_FRAME);
      return true;
    default:
      return false;
  }
}
