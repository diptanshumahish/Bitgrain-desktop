import { signal } from "@bitgrain/core/signal";

interface CanvasAidsVisibility {
  rulers: boolean;
  guides: boolean;
}

const STORAGE_KEY = "bitgrain_canvas_aids";

const DEFAULT_VISIBILITY: CanvasAidsVisibility = { rulers: false, guides: true };

const readStored = (): CanvasAidsVisibility => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBILITY;
    const parsed = JSON.parse(raw) as Partial<CanvasAidsVisibility>;
    return {
      rulers: typeof parsed.rulers === "boolean" ? parsed.rulers : DEFAULT_VISIBILITY.rulers,
      guides: typeof parsed.guides === "boolean" ? parsed.guides : DEFAULT_VISIBILITY.guides,
    };
  } catch {
    return DEFAULT_VISIBILITY;
  }
};

export const canvasAidsSignal = signal<CanvasAidsVisibility>(readStored());

const writeStored = (next: CanvasAidsVisibility): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
};

const setVisibility = (patch: Partial<CanvasAidsVisibility>): void => {
  const next = { ...canvasAidsSignal.value, ...patch };
  canvasAidsSignal.value = next;
  writeStored(next);
};

export const toggleRulers = (): void => setVisibility({ rulers: !canvasAidsSignal.value.rulers });

export const toggleGuides = (): void => setVisibility({ guides: !canvasAidsSignal.value.guides });

export const areGuidesVisible = (): boolean => canvasAidsSignal.value.guides;
