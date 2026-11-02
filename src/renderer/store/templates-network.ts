import { signal } from "../lib/signal";

export type TemplatesNetworkState = "ok" | "slow" | "failed";

const SLOW_NOTICE_AFTER_MS = 8000;

export const templatesNetworkSignal = signal<TemplatesNetworkState>("ok");

export function watchForSlowLoad(): () => void {
  const timer = window.setTimeout(() => {
    if (templatesNetworkSignal.value === "ok") templatesNetworkSignal.value = "slow";
  }, SLOW_NOTICE_AFTER_MS);
  return () => window.clearTimeout(timer);
}

export function markTemplatesLoaded(): void {
  templatesNetworkSignal.value = "ok";
}

export function markTemplatesFailed(): void {
  templatesNetworkSignal.value = "failed";
}

export function hasTemplatesFailed(): boolean {
  return templatesNetworkSignal.value === "failed";
}
