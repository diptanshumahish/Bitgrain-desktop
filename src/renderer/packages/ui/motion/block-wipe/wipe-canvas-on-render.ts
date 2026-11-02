import type { Signal } from "@bitgrain/core/signal";
import { prefersReducedMotion } from "../shared/reduced-motion";
import { createSnapshotOverlay } from "./snapshot-overlay";
import { runBlockWipe } from "./run-block-wipe";

const RENDER_TIMEOUT_MS = 1500;

const whenRenderSettles = (loading: Signal<boolean>, onSettled: () => void): void => {
  let settled = false;
  const settle = (): void => {
    if (settled) return;
    settled = true;
    unsubscribe();
    window.clearTimeout(timeoutId);
    onSettled();
  };
  const unsubscribe = loading.subscribe(() => {
    if (!loading.value) settle();
  });
  const timeoutId = window.setTimeout(settle, RENDER_TIMEOUT_MS);
};

export const wipeCanvasOnRender = (source: HTMLCanvasElement | null, loading: Signal<boolean>): void => {
  if (!source || source.width === 0 || prefersReducedMotion()) return;
  const overlay = createSnapshotOverlay(source);
  if (!overlay) return;
  whenRenderSettles(loading, () => runBlockWipe(overlay));
};
