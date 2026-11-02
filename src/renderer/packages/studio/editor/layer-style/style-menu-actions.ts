import { ClipboardPaste, Paintbrush, ScanSearch } from "lucide-react";
import type { ContextMenuAction } from "@bitgrain/ui/overlays/context-menu-events";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { styleClipboardSignal } from "../../state/style-clipboard-store";
import { MOD_ALT_KEY } from "../shortcut-labels";
import { findMatchingLayerIds } from "./match-layer-style";

interface StyleMenuContext {
  activeIds: string[];
  target: Layer | undefined;
  layers: Layer[];
  setSelectedIds: (ids: string[]) => void;
  handleCopyStyle: (ids: string[]) => void;
  handlePasteStyle: (ids: string[]) => void;
}

const tracked = (action: string, handler: () => void) => (): void => {
  trackEvent("studio", "context_menu_action", { details: { action } });
  handler();
};

const selectMatching = (ctx: StyleMenuContext): void => {
  if (!ctx.target) return;
  ctx.setSelectedIds(findMatchingLayerIds(ctx.layers, ctx.target));
};

export const styleMenuActions = (ctx: StyleMenuContext): ContextMenuAction[] => [
  {
    label: "Copy style", icon: Paintbrush, shortcut: `${MOD_ALT_KEY}C`, dividerBefore: true,
    disabled: ctx.activeIds.length !== 1, onClick: tracked("copy_style", () => ctx.handleCopyStyle(ctx.activeIds)),
  },
  {
    label: "Paste style", icon: ClipboardPaste, shortcut: `${MOD_ALT_KEY}V`,
    disabled: !styleClipboardSignal.value, onClick: tracked("paste_style", () => ctx.handlePasteStyle(ctx.activeIds)),
  },
  {
    label: "Select matching layers", icon: ScanSearch,
    disabled: !ctx.target, onClick: tracked("select_matching", () => selectMatching(ctx)),
  },
];
