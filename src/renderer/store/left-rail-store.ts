import { signal } from "../lib/signal";

// The full-height left rail is a single shell-level container to the left of the
// title bar. Surfaces portal their options panel into it (see LeftRailPortal),
// so the panel runs from the very top of the window while the tabs + actions sit
// only in the content column to its right. Holding the DOM element (rather than a
// React node) keeps each surface's panel inside its own render tree, so panel
// state and handlers work normally with no re-publishing.
export const leftRailElementSignal = signal<HTMLElement | null>(null);
