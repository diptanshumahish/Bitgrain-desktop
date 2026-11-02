import { Scan, SquareDashed } from "lucide-react";
import type { ContextMenuAction } from "@bitgrain/ui/overlays/context-menu-events";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { canBeMask } from "@bitgrain/studio-core/mask/mask-runs";
import { MOD_ALT_KEY } from "../shortcut-labels";

interface MaskMenuContext {
  target: Layer | undefined;
  activeLayers: Layer[];
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

const toggleMaskAction = (ctx: MaskMenuContext, target: Layer): ContextMenuAction => ({
  label: target.isMask ? "Release mask" : "Use as mask",
  icon: SquareDashed,
  shortcut: `${MOD_ALT_KEY}M`,
  dividerBefore: true,
  onClick: () => {
    trackEvent("studio", "context_menu_action", { details: { action: target.isMask ? "release_mask" : "use_as_mask" } });
    ctx.updateLayer(target.id, { isMask: !target.isMask });
  },
});

const maskModeAction = (ctx: MaskMenuContext, target: Layer): ContextMenuAction => {
  const outline = target.maskMode === "vector";
  return {
    label: outline ? "Mask with transparency" : "Mask with outline",
    icon: Scan,
    onClick: () => {
      trackEvent("studio", "context_menu_action", { details: { action: outline ? "mask_alpha" : "mask_outline" } });
      ctx.updateLayer(target.id, { maskMode: outline ? "alpha" : "vector" });
    },
  };
};

export const maskMenuActions = (ctx: MaskMenuContext): ContextMenuAction[] => {
  const target = ctx.target;
  if (!target || ctx.activeLayers.length !== 1 || !canBeMask(target)) return [];
  if (!target.isMask) return [toggleMaskAction(ctx, target)];
  return [toggleMaskAction(ctx, target), maskModeAction(ctx, target)];
};
