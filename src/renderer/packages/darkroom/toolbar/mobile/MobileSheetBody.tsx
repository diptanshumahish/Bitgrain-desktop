import React from "react";
import { EditorExportPanel } from "../editor-export/EditorExportPanel";
import { MorePopover } from "../MorePopover";
import { FiltersPopover } from "../popovers/FiltersPopover";
import { PalettePopover } from "../popovers/PalettePopover";
import { PageColourRow } from "../colour/page-colour/PageColourRow";
import { AlgorithmPopover } from "../popovers/AlgorithmPopover";
import { AdjustPopover } from "../popovers/AdjustPopover";
import { PresetsPopover } from "../popovers/PresetsPopover";
import { LUTPopover } from "../popovers/LUTPopover";
import { InspectorTone } from "../inspector/InspectorTone";
import { MobileEffectsSheet } from "../MobileEffectsSheet";
import { MobileStyleSheetBody } from "./MobileStyleSheetBody";
import type { ToolbarState } from "../use-toolbar-state";
import { MobileRecipeSheet } from "../../recipe/mobile/MobileRecipeSheet";
import { MobileAddStepSheet } from "../../recipe/mobile/MobileAddStepSheet";
import { EffectStepPanel } from "../../recipe/ui/EffectStepPanel";
import { PaperTexture } from "../inspector/tone/PaperTexture";
import type { ActivePopover, ToolbarCallbacks } from "../toolbar-types";

interface MobileSheetBodyProps {
  state: ToolbarState;
  active: ActivePopover;
  showEffects: boolean;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  onCloseEffects: () => void;
  callbacks: ToolbarCallbacks;
}

export const MobileSheetBody: React.FC<MobileSheetBodyProps> = ({ state: s, active, showEffects, toggle, close, onCloseEffects, callbacks }) => (
  <>
    {showEffects && <MobileEffectsSheet state={s} toggle={toggle} onClose={onCloseEffects} />}
    {active === "more" && <MorePopover hasImage={s.hasImage} onClose={close} />}
    {active === "tone" && <InspectorTone />}
    {active === "recipe" && <MobileRecipeSheet />}
    {active === "recipe-add" && <MobileAddStepSheet />}
    {active === "effect" && <EffectStepPanel onCommit={s.onDone} />}
    {active === "finish" && <PaperTexture state={s} />}
    {active === "export" && <EditorExportPanel callbacks={callbacks} onClose={close} />}
    {active === "filters" && <FiltersPopover mode={s.mode} setMode={s.setMode} onClose={close} static />}
    {active === "palette" && <><PageColourRow /><PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={close} static /></>}
    {active === "algorithm" && <AlgorithmPopover ditherMethod={s.ditherMethod} setDitherMethod={s.setDitherMethod} ditherFactor={s.ditherFactor} setDitherFactor={s.setDitherFactor} onStateChangeFinished={s.onDone} onClose={close} static />}
    {active === "adjust" && <AdjustPopover resolution={s.resolution} setResolution={s.setResolution} contrast={s.contrast} setContrast={s.setContrast} brightness={s.brightness} setBrightness={s.setBrightness} saturation={s.saturation} setSaturation={s.setSaturation} grain={s.grain} setGrain={s.setGrain} hue={s.hue} setHue={s.setHue} printFinish={s.printFinish} setPrintFinish={s.setPrintFinish} printFinishStrength={s.printFinishStrength} setPrintFinishStrength={s.setPrintFinishStrength} mode={s.mode} filmGrain={s.isGrainActive} onToggleFilmGrain={s.toggleFilmGrain} onStateChangeFinished={s.onDone} onClose={close} static />}
    {active === "presets" && <PresetsPopover onApplyPreset={s.applyPreset} onClose={close} currentConfig={s.currentConfig} customPresets={callbacks.customPresets} onSaveCustomPreset={callbacks.onSaveCustomPreset} onDeleteCustomPreset={callbacks.onDeleteCustomPreset} static />}
    {active === "lut" && <LUTPopover activeLutId={s.lutId} onSelectLUT={(id) => { s.handleSelectLUT(id); if (id) close(); }} onClose={close} static />}
    <MobileStyleSheetBody state={s} active={active} close={close} />
  </>
);
