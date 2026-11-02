import React from "react";
import { Plus } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { useSignalValue } from "@bitgrain/core/signal";
import { isColorSignal } from "../../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { Button } from "@bitgrain/ui/components/Button";
import { MenuOptionRow } from "@bitgrain/ui/components/MenuOptionRow";
import { styleSettingsSignal } from "../../styles/state/style-store";
import { EffectMenu } from "../../styles/ui/effects/AddEffectButton";
import { effectGroups } from "../../styles/ui/effects/effect-groups";
import { activeEffectKeys } from "@bitgrain/engine/styles/postfx/effect-registry";
import { addEffectStep } from "../add-step-actions";
import { AddStepMenu } from "./AddStepMenu";

const pickEffect = (key: string): void => {
  addEffectStep(key);
  emitPopover(null);
};

const openEffectMenu = (anchorRect: DOMRect): void => {
  const groups = effectGroups(activeEffectKeys(styleSettingsSignal.value.effects));
  emitPopover({ type: "side-menu", anchorRect, content: <EffectMenu groups={groups} onPick={pickEffect} /> });
};

export const AddStepButton: React.FC = () => {
  const isColor = useSignalValue(isColorSignal);
  const hasPaper = useSignalValue(printFinishSignal);
  const open = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const anchorRect = event.currentTarget.getBoundingClientRect();
    const effects = <MenuOptionRow label="Add an effect" detail="Film grain, glow, blur, glitch and more" onClick={() => openEffectMenu(anchorRect)} />;
    emitPopover({ type: "side-menu", anchorRect, content: <AddStepMenu isColor={isColor} hasPaper={hasPaper} effects={effects} /> });
  };
  return (
    <Button variant="secondary" size="md" fullWidth leftIcon={<Plus size={14} strokeWidth={2} />} onClick={open}>
      Add step
    </Button>
  );
};
