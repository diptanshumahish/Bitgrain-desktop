export const FPS_PRESETS = [24, 25, 30, 60] as const;

export const RESOLUTION_PRESETS = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "4K", width: 3840, height: 2160 },
] as const;

export const DEFAULT_PROJECT_WIDTH = 1920;
export const DEFAULT_PROJECT_HEIGHT = 1080;
export const DEFAULT_PROJECT_FPS = 30;

export const TRACK_HEIGHT = 56;
export const TRACK_HEADER_WIDTH = 104;
export const TIME_RULER_HEIGHT = 28;

export const MIN_CLIP_DURATION = 0.1;
export const SNAP_THRESHOLD_PX = 8;

export const DEFAULT_TIMELINE_PIXELS_PER_SECOND = 60;
export const MIN_TIMELINE_PIXELS_PER_SECOND = 12;
export const MAX_TIMELINE_PIXELS_PER_SECOND = 480;
export const TIMELINE_MIN_VISIBLE_SECONDS = 30;
export const TIMELINE_TAIL_SECONDS = 60;

export const CLIP_FADE_STEP_SECONDS = 0.05;
export const CLIP_FADE_MAX_SECONDS = 5;

export const MIN_CLIP_SPEED = 0.25;
export const MAX_CLIP_SPEED = 4;
