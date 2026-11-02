import { signal } from "../../../../lib/signal";
import type { PreflightItem } from "../../hooks/export/print/preflight/preflight-types";

export const printModeSignal = signal(false);
export const preflightSignal = signal<PreflightItem[] | null>(null);
