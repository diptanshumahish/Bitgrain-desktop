import React from "react";
import { SunMedium } from "lucide-react";
import { TabButton } from "../../../components/toolbar/TabButton";
import { useSignalValue } from "../../../lib/signal";
import { isNeutralGrade } from "../engine/grade-checks";
import { activeMaskLayers } from "../mask/mask-defaults";
import { colorGradeSignal } from "./editor-grade-store";
import { masksSignal } from "./editor-mask-store";
import { toggleTonePanel } from "./tone-panel-events";

interface ToneTabButtonProps {
  disabled: boolean;
}

export const ToneTabButton: React.FC<ToneTabButtonProps> = ({ disabled }) => {
  const grade = useSignalValue(colorGradeSignal);
  const masks = useSignalValue(masksSignal);
  const edited = !isNeutralGrade(grade) || activeMaskLayers(masks).length > 0;

  return (
    <TabButton
      icon={<SunMedium size={14} strokeWidth={2} />}
      label="tone"
      active={edited}
      onClick={toggleTonePanel}
      disabled={disabled}
      disabledTooltip="Upload an image first"
    />
  );
};
