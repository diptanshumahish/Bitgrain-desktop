import { signal } from "@bitgrain/core/signal";
import type { PreflightItem } from "@bitgrain/studio-core/render/print/preflight/preflight-types";

export const printModeSignal = signal(false);
export const preflightSignal = signal<PreflightItem[] | null>(null);
export const printPaperSignal = signal<string | null>(null);
export const lockDotSizeSignal = signal(true);
