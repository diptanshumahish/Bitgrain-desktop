import { signal } from "@bitgrain/core/signal";
import type { ConversionFormat } from "../../upload/upload-errors";

export const convertedSourceSignal = signal<ConversionFormat | null>(null);
