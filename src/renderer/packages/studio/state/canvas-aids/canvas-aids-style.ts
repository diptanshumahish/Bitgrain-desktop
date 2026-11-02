import { signal } from "@bitgrain/core/signal";

interface CanvasAidsStyle {
  guideColor: string;
  safeZoneColor: string;
  marginPx: number;
  spacingPx: number;
}

const STORAGE_KEY = "bitgrain_canvas_aids_style";

const DEFAULT_CANVAS_AIDS_STYLE: CanvasAidsStyle = {
  guideColor: "#ff5c39",
  safeZoneColor: "#ef3b3b",
  marginPx: 40,
  spacingPx: 100,
};

const readNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const readStored = (): CanvasAidsStyle => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CANVAS_AIDS_STYLE;
    const parsed = JSON.parse(raw) as Partial<CanvasAidsStyle>;
    return {
      guideColor: typeof parsed.guideColor === "string" ? parsed.guideColor : DEFAULT_CANVAS_AIDS_STYLE.guideColor,
      safeZoneColor: typeof parsed.safeZoneColor === "string" ? parsed.safeZoneColor : DEFAULT_CANVAS_AIDS_STYLE.safeZoneColor,
      marginPx: readNumber(parsed.marginPx, DEFAULT_CANVAS_AIDS_STYLE.marginPx),
      spacingPx: readNumber(parsed.spacingPx, DEFAULT_CANVAS_AIDS_STYLE.spacingPx),
    };
  } catch {
    return DEFAULT_CANVAS_AIDS_STYLE;
  }
};

export const canvasAidsStyleSignal = signal<CanvasAidsStyle>(readStored());

export const setCanvasAidsStyle = (patch: Partial<CanvasAidsStyle>): void => {
  const next = { ...canvasAidsStyleSignal.value, ...patch };
  canvasAidsStyleSignal.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
};
