import { signal } from "@bitgrain/core/signal";
import type { AnimateFraming } from "@bitgrain/studio-core/animate/framing/frame-canvas";

export const animateFramingSignal = signal<AnimateFraming>("original");
