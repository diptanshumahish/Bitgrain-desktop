export type WelcomeScene = "hello" | "showcase" | "library" | "editor" | "animate" | "choose";

export const WELCOME_SCENES: readonly WelcomeScene[] = ["hello", "showcase", "library", "editor", "animate", "choose"];

export const INTRO_SCENE_COUNT = 5;
export const CHOOSE_SCENE_INDEX = 5;

export const SCENE_DURATIONS_MS: Record<WelcomeScene, number | null> = {
  hello: 5200,
  showcase: 7200,
  library: 7000,
  editor: 12600,
  animate: 8600,
  choose: null,
};

export const WORD_STEP_MS = 90;
export const WORD_DURATION_MS = 900;
export const LINE_GAP_MS = 1100;

export const OVERLAY_ENTER_MS = 700;
export const OVERLAY_EXIT_MS = 520;

export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
