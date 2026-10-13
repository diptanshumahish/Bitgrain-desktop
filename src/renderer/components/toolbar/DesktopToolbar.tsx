import React from "react";
import { LayoutTemplate, Plus } from "lucide-react";
import { TabButton } from "./TabButton";
import { RollingDiceIcon } from "./rolling-dice/RollingDiceIcon";
import { GradeLockGroup } from "./GradeLockGroup";
import { PresetsPopover } from "./popovers/PresetsPopover";
import { SectionLogo } from "../section-nav/SectionLogo";
import { EffectsTab } from "./desktop/EffectsTab";
import { AdjustTabs } from "./desktop/AdjustTabs";
import { ColourTab } from "./desktop/ColourTab";
import { ExportTab } from "./desktop/ExportTab";
import { PrintFinishTab } from "./desktop/PrintFinishTab";
import { MoreTab } from "./desktop/MoreTab";
import { trackEvent } from "../../lib/tracker";
import type { ToolbarState } from "./use-toolbar-state";
import type { Preset, PresetConfig } from "./popovers/PresetsPopover";
import type { DownloadRasterFn } from "../../engine/export/export-types";

export type ActivePopover =
  | "effects" | "colour" | "filters" | "palette" | "algorithm" | "adjust"
  | "export" | "presets" | "lut" | "haze-bloom" | "halftone" | "popart" | "ascii" | "braille" | "contour"
  | "inkwash" | "manga" | "more"
  | null;

export interface ToolbarCallbacks {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMosh: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
}

interface DesktopToolbarProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
  imageAccept: string;
}

const Divider: React.FC = () => <div className="w-px h-6 bg-[var(--s-border)] mx-1.5 self-center shrink-0" />;

const NO_IMAGE_TIP = "Upload an image first";

export const DesktopToolbar: React.FC<DesktopToolbarProps> = ({ state: s, active, toggle, close, callbacks, imageAccept }) => (
  <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-50 items-center">
    <div className="relative flex items-center bg-[var(--s-bg-panel)]/90 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 px-2 py-1.5 gap-0.5 font-editorial">
      <SectionLogo className="flex items-center shrink-0 mx-1 cursor-pointer group" imageClassName="w-7 h-7 shrink-0 rounded object-cover group-hover:scale-105 transition-transform" />
      <Divider />
      <label data-tutorial="home-upload" className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl cursor-pointer text-[var(--s-text-muted)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-all duration-100 min-w-[48px] lg:min-w-[60px] active:scale-95 focus-within:ring-2 focus-within:ring-[var(--s-accent)]">
        <Plus size={14} strokeWidth={2.5} />
        <span className="text-[12px] font-medium leading-none">open</span>
        <input type="file" className="sr-only" onChange={callbacks.onImageUpload} accept={imageAccept} aria-label="Open an image" />
      </label>
      <Divider />
      <GradeLockGroup locked={!!s.lutId}>
        <EffectsTab state={s} active={active} toggle={toggle} close={close} />
      </GradeLockGroup>
      <div className="relative" data-tutorial="home-presets">
        <TabButton icon={<LayoutTemplate size={14} strokeWidth={2} />} label="presets" active={active === "presets"} expanded={active === "presets"} onClick={() => toggle("presets")} disabled={!s.hasImage} disabledTooltip={NO_IMAGE_TIP} />
        {active === "presets" && <PresetsPopover onApplyPreset={s.applyPreset} onClose={close} currentConfig={s.currentConfig} customPresets={callbacks.customPresets} onSaveCustomPreset={callbacks.onSaveCustomPreset} onDeleteCustomPreset={callbacks.onDeleteCustomPreset} />}
      </div>
      <TabButton icon={<RollingDiceIcon size={14} />} label="shuffle" onClick={() => { callbacks.onMosh(); trackEvent("home", "mosh_click"); }} disabled={!s.hasImage} disabledTooltip={NO_IMAGE_TIP} />
      <Divider />
      <AdjustTabs state={s} active={active} toggle={toggle} close={close} />
      <Divider />
      <ColourTab state={s} active={active} toggle={toggle} close={close} />
      <PrintFinishTab state={s} />
      <Divider />
      <ExportTab state={s} active={active} toggle={toggle} close={close} callbacks={callbacks} />
      <MoreTab hasImage={s.hasImage} active={active} toggle={toggle} close={close} />
    </div>
  </div>
);
