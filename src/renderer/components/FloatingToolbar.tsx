import React, { useState } from "react";
import { CanvasToolbar } from "./toolbar/CanvasToolbar";
import { useToolbarState } from "./toolbar/use-toolbar-state";
import { DesktopToolbar, type ActivePopover } from "./toolbar/DesktopToolbar";
import { MobileToolbar } from "./toolbar/MobileToolbar";
import { IMAGE_ACCEPT } from "../pages/home-page/accept-formats";
import type { PresetConfig, Preset } from "./toolbar/popovers/PresetsPopover";
import type { DownloadRasterFn } from "../engine/export/export-types";

const EFFECT_POPOVERS: ActivePopover[] = ["filters", "palette", "algorithm", "adjust"];

interface FloatingToolbarProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMosh: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  credits: { png: number; svg: number };
  compareMode: boolean;
  onToggleCompare: () => void;
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  onClear: () => void;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = (props) => {
  const [active, setActive] = useState<ActivePopover>(null);
  const state = useToolbarState();

  const toggle = (key: ActivePopover) => setActive((prev) => (prev === key ? null : key));
  const close = () => setActive(null);

  const handleSelectLUT = (id: string | null) => {
    state.handleSelectLUT(id);
    if (id && active && EFFECT_POPOVERS.includes(active)) setActive(null);
  };

  const decoratedState = { ...state, handleSelectLUT };

  const callbacks = {
    onImageUpload: props.onImageUpload,
    onMosh: props.onMosh,
    onDownloadRaster: props.onDownloadRaster,
    onDownloadSvg: props.onDownloadSvg,
    onSharePreset: props.onSharePreset,
    shareState: props.shareState,
    credits: props.credits,
    transparentBg: props.transparentBg,
    onToggleTransparentBg: props.onToggleTransparentBg,
    customPresets: props.customPresets,
    onSaveCustomPreset: props.onSaveCustomPreset,
    onDeleteCustomPreset: props.onDeleteCustomPreset,
  };

  return (
    <>
      <CanvasToolbar
        onImageUpload={props.onImageUpload}
        onClear={props.onClear}
        compareMode={props.compareMode}
        onToggleCompare={props.onToggleCompare}
      />
      <DesktopToolbar
        state={decoratedState}
        active={active}
        toggle={toggle}
        close={close}
        callbacks={callbacks}
        imageAccept={IMAGE_ACCEPT}
      />
      <MobileToolbar
        state={decoratedState}
        active={active}
        toggle={toggle}
        close={close}
        callbacks={callbacks}
        onClear={props.onClear}
        onToggleCompare={props.onToggleCompare}
        compareMode={props.compareMode}
        imageAccept={IMAGE_ACCEPT}
      />
    </>
  );
};
