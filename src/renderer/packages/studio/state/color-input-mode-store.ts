import { signal } from "@bitgrain/core/signal";
import type { ColorInputMode } from "../ui/color-picker/color-channels";

export const colorInputModeSignal = signal<ColorInputMode>("hex");
