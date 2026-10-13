import { useEffect } from "react";
import { patchEditorFrame, resetEditorFrame, type EditorFrame } from "./editor-frame-store";
import { headlineLength, type PosterName } from "./build-frame-template";
import { sparkleWelcomeExport } from "../../../sound/welcome-sound";
import {
  CLICK_EXPORT_MS,
  CLICK_HEADLINE_MS,
  CLICK_PALETTE_MS,
  DROP_PHOTO_MS,
  LETTER_STEP_MS,
  PICK_PHOTO_MS,
  PICK_TEMPLATE_MS,
  TYPE_START_MS,
} from "./editor-timeline";

interface TimelineEvent {
  atMs: number;
  patch: Partial<EditorFrame>;
}

const STEP_EVENTS: TimelineEvent[] = [
  { atMs: PICK_TEMPLATE_MS, patch: { loaded: true, selection: "template", step: 1 } },
  { atMs: CLICK_HEADLINE_MS, patch: { selection: "headline", step: 2 } },
  { atMs: PICK_PHOTO_MS, patch: { selection: null, dragging: true, step: 3 } },
  { atMs: DROP_PHOTO_MS, patch: { selection: "photo", dragging: false, photo: "swapped" } },
  { atMs: CLICK_PALETTE_MS, patch: { selection: "palette", palette: "rose", step: 4 } },
  { atMs: CLICK_EXPORT_MS, patch: { selection: "export", exported: true, step: 5 } },
];

const typingEvents = (name: PosterName): TimelineEvent[] =>
  Array.from({ length: headlineLength(name) + 1 }, (_, letters) => ({
    atMs: TYPE_START_MS + letters * LETTER_STEP_MS,
    patch: { typedLetters: letters },
  }));

export const useEditorTimeline = (name: PosterName): void => {
  const { firstName, lastName } = name;

  useEffect(() => {
    resetEditorFrame();
    const events = [...STEP_EVENTS, ...typingEvents({ firstName, lastName })];
    const timers = events.map((event) => window.setTimeout(() => patchEditorFrame(event.patch), event.atMs));
    timers.push(window.setTimeout(sparkleWelcomeExport, CLICK_EXPORT_MS));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [firstName, lastName]);
};
