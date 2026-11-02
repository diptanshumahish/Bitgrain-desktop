import { compareModeSignal } from "../../../store/editor-view-store";
import { isZoomedIn, panBy } from "./preview-zoom-store";

const SPACE_KEY = "Space";
const PRIMARY_BUTTON = 0;
const PAN_IGNORED_TARGETS = "input, textarea, select, button, a, [contenteditable], [role=slider]";

interface PanState {
  spaceHeld: boolean;
  dragging: boolean;
  lastX: number;
  lastY: number;
}

const isIgnoredTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest(PAN_IGNORED_TARGETS);

const isPanKey = (event: KeyboardEvent): boolean => event.code === SPACE_KEY && !isIgnoredTarget(event.target);

const canDragPan = (state: PanState, event: PointerEvent): boolean => {
  if (event.button !== PRIMARY_BUTTON || isIgnoredTarget(event.target)) return false;
  return state.spaceHeld || (isZoomedIn() && !compareModeSignal.value);
};

const setCursorState = (stage: HTMLElement, state: PanState): void => {
  if (state.dragging) stage.dataset.panning = "dragging";
  else if (state.spaceHeld) stage.dataset.panning = "ready";
  else delete stage.dataset.panning;
};

const keyHandlers = (stage: HTMLElement, state: PanState): [(event: KeyboardEvent) => void, (event: KeyboardEvent) => void] => [
  (event) => {
    if (!isPanKey(event)) return;
    event.preventDefault();
    state.spaceHeld = true;
    setCursorState(stage, state);
  },
  (event) => {
    if (event.code !== SPACE_KEY) return;
    Object.assign(state, { spaceHeld: false, dragging: false });
    setCursorState(stage, state);
  },
];

const startDrag = (stage: HTMLElement, state: PanState, event: PointerEvent): void => {
  if (!canDragPan(state, event)) return;
  event.preventDefault();
  event.stopPropagation();
  stage.setPointerCapture(event.pointerId);
  Object.assign(state, { dragging: true, lastX: event.clientX, lastY: event.clientY });
  setCursorState(stage, state);
};

const moveDrag = (state: PanState, event: PointerEvent): void => {
  if (!state.dragging) return;
  panBy(event.clientX - state.lastX, event.clientY - state.lastY);
  Object.assign(state, { lastX: event.clientX, lastY: event.clientY });
};

export const attachDragPan = (stage: HTMLElement): (() => void) => {
  const state: PanState = { spaceHeld: false, dragging: false, lastX: 0, lastY: 0 };
  const [onKeyDown, onKeyUp] = keyHandlers(stage, state);
  const onPointerDown = (event: PointerEvent): void => startDrag(stage, state, event);
  const onPointerMove = (event: PointerEvent): void => moveDrag(state, event);
  const onPointerUp = (): void => {
    state.dragging = false;
    setCursorState(stage, state);
  };
  stage.addEventListener("pointerdown", onPointerDown, { capture: true });
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  return () => {
    stage.removeEventListener("pointerdown", onPointerDown, { capture: true });
    stage.removeEventListener("pointermove", onPointerMove);
    stage.removeEventListener("pointerup", onPointerUp);
    stage.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
};
