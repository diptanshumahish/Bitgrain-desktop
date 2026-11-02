import React from "react";
import { MobileSheet, type SheetBack } from "./mobile/MobileSheet";
import { MobileSheetBody } from "./mobile/MobileSheetBody";
import { MobileQuickActions } from "./mobile/MobileQuickActions";
import { MobileTabBar } from "./mobile/MobileTabBar";
import { sheetTitle } from "./mobile/sheet-title";
import { isFromEffectsSheet } from "./popover-back/from-effects-sheet";
import { useSignalValue } from "@bitgrain/core/signal";
import { mobileEffectsSheetSignal } from "./panel-state/active-panel-store";
import { clearRecipeOrigin, openedFromRecipeSignal } from "../recipe/mobile/mobile-step-panel";
import { trackEvent } from "@bitgrain/platform/tracker";
import { useToolbarState, type ToolbarState } from "./use-toolbar-state";
import type { ActivePopover, ToolbarCallbacks } from "./toolbar-types";
import { PHONE_TAB_BAR_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface MobileToolbarProps {
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
  onClear: () => void;
  onToggleCompare: () => void;
  imageAccept: string;
}

const setShowEffects = (open: boolean): void => {
  mobileEffectsSheetSignal.value = open;
};

const hasAppliedEffects = (s: ToolbarState): boolean =>
  s.mode.includes("dither") || s.isHalftoneActive || s.mode.includes("popart") ||
  !!s.lutId || s.hasActiveHazeBloom || s.hasActiveFilters || !!s.palette;

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  active, toggle, close, callbacks, onClear, onToggleCompare, imageAccept,
}) => {
  const state = useToolbarState();
  const showEffects = useSignalValue(mobileEffectsSheetSignal);
  const fromRecipe = useSignalValue(openedFromRecipeSignal);
  if (!state.hasImage) return null;

  const closeAll = (): void => {
    setShowEffects(false);
    clearRecipeOrigin();
    close();
  };
  const openPanel = (key: Exclude<ActivePopover, null>): void => {
    setShowEffects(false);
    clearRecipeOrigin();
    if (key === "export" && active !== "export") trackEvent("home", "export_dialog_opened", { details: { source: "mobile_toolbar" } });
    toggle(key);
  };
  const openEffects = (): void => {
    close();
    setShowEffects(!showEffects);
  };
  const backToEffects = (): void => {
    close();
    setShowEffects(true);
  };
  const handleMosh = (): void => {
    callbacks.onMosh();
    trackEvent("home", "mosh_click");
  };
  const backToRecipe = (): void => {
    clearRecipeOrigin();
    toggle("recipe");
  };
  const sheetOpen = !!active || showEffects;
  const sheetBack = (): SheetBack | null => {
    if (fromRecipe && active !== "recipe") return { label: "Recipe", onBack: backToRecipe };
    if (isFromEffectsSheet(active)) return { label: "Effects", onBack: backToEffects };
    return null;
  };

  return (
    <div className={`md:hidden shrink-0 relative ${PHONE_TAB_BAR_LAYER} flex flex-col font-editorial`}>
      {sheetOpen && (
        <MobileSheet title={sheetTitle(active, showEffects)} back={sheetBack()} onClose={closeAll}>
          <MobileSheetBody state={state} active={active} showEffects={showEffects} toggle={toggle} close={close} onCloseEffects={() => setShowEffects(false)} callbacks={callbacks} />
        </MobileSheet>
      )}
      <div className="relative z-10 bg-[var(--s-bg-panel)] border-t border-[var(--s-border)] pb-safe">
        {!sheetOpen && (
          <MobileQuickActions state={state} onToggleCompare={onToggleCompare} onClear={onClear} onMosh={handleMosh} onOpenSheet={openPanel} />
        )}
        <MobileTabBar
          state={state}
          active={active}
          effectsOpen={showEffects}
          effectsApplied={hasAppliedEffects(state)}
          imageAccept={imageAccept}
          onImageUpload={callbacks.onImageUpload}
          onOpenEffects={openEffects}
          onOpenPanel={openPanel}
        />
      </div>
    </div>
  );
};
