import React from "react";
import { Filter, Haze, SlidersHorizontal } from "lucide-react";
import { TabButton } from "../TabButton";
import { GradeLockGroup } from "../GradeLockGroup";
import { AdjustPopover } from "../popovers/AdjustPopover";
import { FiltersPopover } from "../popovers/FiltersPopover";
import { HazeBloomPopover } from "../popovers/HazeBloomPopover";
import { ToneTabButton } from "../../../modules/grading/editor/ToneTabButton";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

interface AdjustTabsProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
}

const NO_IMAGE_TIP = "Upload an image first";

export const AdjustTabs: React.FC<AdjustTabsProps> = ({ state: s, active, toggle, close }) => (
  <>
    <GradeLockGroup locked={!!s.lutId}>
      <div className="relative" data-tutorial="home-adjust">
        <TabButton icon={<SlidersHorizontal size={14} strokeWidth={2} />} label="adjust" active={active === "adjust"} expanded={active === "adjust"} onClick={() => toggle("adjust")} disabled={!s.hasImage} disabledTooltip={NO_IMAGE_TIP} />
        {active === "adjust" && <AdjustPopover resolution={s.resolution} setResolution={s.setResolution} contrast={s.contrast} setContrast={s.setContrast} brightness={s.brightness} setBrightness={s.setBrightness} saturation={s.saturation} setSaturation={s.setSaturation} grain={s.grain} setGrain={s.setGrain} hue={s.hue} setHue={s.setHue} printFinish={s.printFinish} setPrintFinish={s.setPrintFinish} printFinishStrength={s.printFinishStrength} setPrintFinishStrength={s.setPrintFinishStrength} mode={s.mode} filmGrain={s.isGrainActive} onToggleFilmGrain={s.toggleFilmGrain} onStateChangeFinished={s.onDone} onClose={close} />}
      </div>
    </GradeLockGroup>
    <ToneTabButton disabled={!s.hasImage} />
    <GradeLockGroup locked={!!s.lutId}>
      <div className="relative">
        <TabButton icon={<Filter size={14} strokeWidth={2} />} label="filters" active={active === "filters"} expanded={active === "filters"} indicator={s.hasActiveFilters && active !== "filters"} onClick={() => toggle("filters")} disabled={!s.hasImage} disabledTooltip={NO_IMAGE_TIP} />
        {active === "filters" && <FiltersPopover mode={s.mode} setMode={s.setMode} onClose={close} />}
      </div>
    </GradeLockGroup>
    <div className="relative">
      <TabButton icon={<Haze size={14} strokeWidth={2} />} label="haze" active={active === "haze-bloom"} expanded={active === "haze-bloom"} indicator={s.hasActiveHazeBloom && active !== "haze-bloom"} onClick={() => toggle("haze-bloom")} disabled={!s.hasImage} disabledTooltip={NO_IMAGE_TIP} />
      {active === "haze-bloom" && <HazeBloomPopover mode={s.mode} onToggle={s.toggleHazeBloom} hazeIntensity={s.hazeIntensity} setHazeIntensity={s.setHazeIntensity} bloomIntensity={s.bloomIntensity} setBloomIntensity={s.setBloomIntensity} bloomThreshold={s.bloomThreshold} setBloomThreshold={s.setBloomThreshold} hazeWarmth={s.hazeWarmth} setHazeWarmth={s.setHazeWarmth} onStateChangeFinished={s.onDone} onClose={close} />}
    </div>
  </>
);
