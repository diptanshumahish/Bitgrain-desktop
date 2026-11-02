import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { emitStudioModal } from "../../../modals/studio-dialog/host/studio-modal-events";
import { emitTutorial } from "@bitgrain/ui/tutorial/tutorial-events";
import type { PaletteEntry } from "./palette-entry";

export const LEARN_ENTRIES: PaletteEntry[] = [
  { id: "learn-tour", label: "Take the studio tour", group: "Learn", keywords: ["tutorial", "onboarding", "walkthrough", "help", "start", "new here", "how does this work", "show me around", "getting started", "learn"], hint: "A one minute walk through the editor", run: () => emitTutorial({ type: "start", tutorialId: "studio" }) },
  { id: "learn-shortcuts", label: "Keyboard shortcuts", group: "Learn", keywords: ["keys", "hotkeys", "cheat sheet", "keyboard", "faster", "shortcut list"], shortcut: "?", run: () => emitStudioModal({ type: "keyboard-shortcuts" }) },
  { id: "learn-support", label: "Ask for help or report a bug", group: "Learn", keywords: ["support", "contact", "feedback", "bug", "feature request", "broken", "not working", "problem", "suggestion", "talk to someone"], run: () => emitPlatformModal({ type: "ticket" }) },
];
