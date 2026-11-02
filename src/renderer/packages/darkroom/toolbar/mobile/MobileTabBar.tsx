import React from "react";
import { Download, ListOrdered, Plus, SlidersHorizontal } from "lucide-react";
import { MobilePrimaryTab } from "./MobilePrimaryTab";
import { currentEffectGlyph, currentEffectLabel } from "../effects/current-effect-label";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../toolbar-types";

interface MobileTabBarProps {
  state: ToolbarState;
  active: ActivePopover;
  effectsOpen: boolean;
  effectsApplied: boolean;
  imageAccept: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenEffects: () => void;
  onOpenPanel: (key: "adjust" | "recipe" | "export") => void;
}

const ICON_SIZE = 20;

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ state: s, active, effectsOpen, effectsApplied, imageAccept, onImageUpload, onOpenEffects, onOpenPanel }) => (
  <div className="grid grid-cols-5 gap-1 px-2 pt-1.5 pb-1">
    <label
      data-tutorial="home-upload"
      className="flex flex-col items-center justify-center gap-1 min-h-[52px] rounded-xl text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)] cursor-pointer transition-colors"
    >
      <Plus size={ICON_SIZE} strokeWidth={2} />
      <span className="text-[12px] font-medium leading-none">Open</span>
      <input type="file" className="sr-only" onChange={onImageUpload} accept={imageAccept} aria-label="Open another photo" />
    </label>
    <div data-tutorial="home-algorithm">
      <MobilePrimaryTab
        icon={<span aria-hidden="true" className="font-mono text-[12px] leading-none h-5 inline-flex items-center select-none">{currentEffectGlyph(s.mode)}</span>}
        label={currentEffectLabel(s.mode)}
        active={effectsOpen || effectsApplied}
        onClick={onOpenEffects}
      />
    </div>
    <div data-tutorial="home-adjust">
      <MobilePrimaryTab icon={<SlidersHorizontal size={ICON_SIZE} strokeWidth={1.75} />} label="adjust" active={active === "adjust"} onClick={() => onOpenPanel("adjust")} />
    </div>
    <div data-tutorial="home-recipe">
      <MobilePrimaryTab icon={<ListOrdered size={ICON_SIZE} strokeWidth={1.75} />} label="recipe" active={active === "recipe" || active === "recipe-add"} onClick={() => onOpenPanel("recipe")} />
    </div>
    <div data-tutorial="home-export">
      <MobilePrimaryTab icon={<Download size={ICON_SIZE} strokeWidth={1.75} />} label="export" active={active === "export"} onClick={() => onOpenPanel("export")} />
    </div>
  </div>
);
