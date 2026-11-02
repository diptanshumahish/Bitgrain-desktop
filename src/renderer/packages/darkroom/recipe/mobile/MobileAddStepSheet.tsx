import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { isColorSignal } from "../../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { styleSettingsSignal } from "../../styles/state/style-store";
import { EffectMenu } from "../../styles/ui/effects/AddEffectButton";
import { effectGroups } from "../../styles/ui/effects/effect-groups";
import { activeEffectKeys } from "@bitgrain/engine/styles/postfx/effect-registry";
import { addEffectStep } from "../add-step-actions";
import { AddStepMenu } from "../ui/AddStepMenu";

const INLINE_EFFECTS_CLASS = "flex flex-col";
const SHEET_MENU_CLASS = "flex flex-col p-1.5 font-editorial";

export const MobileAddStepSheet: React.FC = () => {
  const isColor = useSignalValue(isColorSignal);
  const hasPaper = useSignalValue(printFinishSignal);
  const activeKeys = activeEffectKeys(useSignalValue(styleSettingsSignal).effects);
  return (
    <AddStepMenu isColor={isColor} hasPaper={hasPaper} className={SHEET_MENU_CLASS}
      effects={<EffectMenu groups={effectGroups(activeKeys)} onPick={addEffectStep} className={INLINE_EFFECTS_CLASS} />} />
  );
};
