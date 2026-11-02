import { useSignalValue } from "@bitgrain/core/signal";
import { lutIdSignal, modesSignal, paletteSignal } from "../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { loopSettingsSignal, type LoopMotion } from "./loop-settings";
import { availableLoopMotions, resolveLoopMotion } from "./engine/loop-motions";

interface LoopMotionState {
  available: LoopMotion[];
  motion: LoopMotion | null;
}

export const useLoopMotion = (): LoopMotionState => {
  const modes = useSignalValue(modesSignal);
  const lutId = useSignalValue(lutIdSignal);
  const printFinish = useSignalValue(printFinishSignal);
  const palette = useSignalValue(paletteSignal);
  const preferred = useSignalValue(loopSettingsSignal).motion;
  const available = availableLoopMotions({ modes, lutId, printFinish, palette });
  return { available, motion: resolveLoopMotion(preferred, available) };
};
