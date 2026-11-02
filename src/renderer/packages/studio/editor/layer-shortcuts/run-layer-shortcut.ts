import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { emitStudioModal } from "../../modals/studio-dialog/host/studio-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { layerClipboardSignal } from "../../state/layer-clipboard-store";
import { arrangeInParents } from "./arrange-in-parents";
import { toggleLocked, toggleMask, toggleVisible } from "./toggle-layer-flags";
import type { LayerShortcut } from "./read-layer-shortcut";

export interface LayerShortcutContext {
  selectedIds: string[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  pushHistory: () => void;
  handleCopyStyle: (ids: string[]) => void;
  handlePasteStyle: (ids: string[]) => void;
  handlePasteInPlace: () => void;
}

const SELECTION_SHORTCUTS = new Set<LayerShortcut["kind"]>([
  "arrange", "copy-style", "paste-style", "toggle-lock", "toggle-hide", "toggle-mask",
]);

export const canRunShortcut = (shortcut: LayerShortcut, ctx: LayerShortcutContext): boolean => {
  if (shortcut.kind === "paste-in-place") return layerClipboardSignal.value !== null;
  return !SELECTION_SHORTCUTS.has(shortcut.kind) || ctx.selectedIds.length > 0;
};

const updateLayers = (ctx: LayerShortcutContext, update: (prev: Layer[]) => Layer[]): void => {
  ctx.pushHistory();
  ctx.setLayers(update);
};

export const runLayerShortcut = (shortcut: LayerShortcut, ctx: LayerShortcutContext): void => {
  const ids = ctx.selectedIds;
  trackEvent("studio", "layer_shortcut_used", { details: { shortcut: shortcut.kind } });
  if (shortcut.kind === "arrange") updateLayers(ctx, (prev) => arrangeInParents(prev, ids, shortcut.arrange));
  if (shortcut.kind === "toggle-lock") updateLayers(ctx, (prev) => toggleLocked(prev, ids));
  if (shortcut.kind === "toggle-hide") updateLayers(ctx, (prev) => toggleVisible(prev, ids));
  if (shortcut.kind === "toggle-mask") updateLayers(ctx, (prev) => toggleMask(prev, ids));
  if (shortcut.kind === "copy-style") ctx.handleCopyStyle(ids);
  if (shortcut.kind === "paste-style") ctx.handlePasteStyle(ids);
  if (shortcut.kind === "paste-in-place") ctx.handlePasteInPlace();
  if (shortcut.kind === "show-shortcuts") emitStudioModal({ type: "keyboard-shortcuts" });
};
