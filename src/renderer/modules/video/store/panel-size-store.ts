import { signal } from "../../../lib/signal";

const STORAGE_KEY = "video-editor-panel-sizes";

export const MIN_SIDE_PANEL_WIDTH = 200;
export const MAX_SIDE_PANEL_WIDTH = 600;
export const MIN_PREVIEW_HEIGHT = 200;
export const MIN_TIMELINE_HEIGHT = 140;

const DEFAULT_LEFT_WIDTH = 300;
const DEFAULT_RIGHT_WIDTH = 300;
const DEFAULT_TIMELINE_HEIGHT = 280;

interface PanelSizes {
  leftWidth: number;
  rightWidth: number;
  timelineHeight: number;
}

const loadSizes = (): PanelSizes => {
  if (typeof window === "undefined") {
    return {
      leftWidth: DEFAULT_LEFT_WIDTH,
      rightWidth: DEFAULT_RIGHT_WIDTH,
      timelineHeight: DEFAULT_TIMELINE_HEIGHT,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no stored sizes");
    const parsed = JSON.parse(raw) as Partial<PanelSizes>;
    return {
      leftWidth: parsed.leftWidth ?? DEFAULT_LEFT_WIDTH,
      rightWidth: parsed.rightWidth ?? DEFAULT_RIGHT_WIDTH,
      timelineHeight: parsed.timelineHeight ?? DEFAULT_TIMELINE_HEIGHT,
    };
  } catch {
    return {
      leftWidth: DEFAULT_LEFT_WIDTH,
      rightWidth: DEFAULT_RIGHT_WIDTH,
      timelineHeight: DEFAULT_TIMELINE_HEIGHT,
    };
  }
};

const initial = loadSizes();

export const leftPanelWidthSignal = signal<number>(initial.leftWidth);
export const rightPanelWidthSignal = signal<number>(initial.rightWidth);
export const timelineHeightSignal = signal<number>(initial.timelineHeight);

const persist = (): void => {
  if (typeof window === "undefined") return;
  const data: PanelSizes = {
    leftWidth: leftPanelWidthSignal.value,
    rightWidth: rightPanelWidthSignal.value,
    timelineHeight: timelineHeightSignal.value,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const setLeftPanelWidth = (width: number): void => {
  leftPanelWidthSignal.value = clamp(width, MIN_SIDE_PANEL_WIDTH, MAX_SIDE_PANEL_WIDTH);
  persist();
};

export const setRightPanelWidth = (width: number): void => {
  rightPanelWidthSignal.value = clamp(width, MIN_SIDE_PANEL_WIDTH, MAX_SIDE_PANEL_WIDTH);
  persist();
};

export const setTimelineHeight = (height: number, maxHeight: number): void => {
  const max = Math.max(MIN_TIMELINE_HEIGHT, maxHeight - MIN_PREVIEW_HEIGHT);
  timelineHeightSignal.value = clamp(height, MIN_TIMELINE_HEIGHT, max);
  persist();
};
