import { signal } from "../../../lib/signal";
import type { AnimateFraming } from "../../../engine/animate/framing/frame-canvas";

export const animateFramingSignal = signal<AnimateFraming>("original");
