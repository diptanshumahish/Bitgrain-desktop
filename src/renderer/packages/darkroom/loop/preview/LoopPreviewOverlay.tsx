import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { compareModeSignal } from "../../state/editor-view-store";
import { modesSignal } from "../../state/transform-store";
import { loopSettingsSignal } from "../loop-settings";
import { useLoopMotion } from "../use-loop-motion";
import { loopPreviewSignal } from "./loop-preview-store";
import { LoopPreviewCanvas } from "./LoopPreviewCanvas";

const SMOOTH_MODE = "halftone";

export const LoopPreviewOverlay: React.FC = () => {
  const playing = useSignalValue(loopPreviewSignal);
  const compareMode = useSignalValue(compareModeSignal);
  const fps = useSignalValue(loopSettingsSignal).fps;
  const modes = useSignalValue(modesSignal);
  const motion = useLoopMotion().motion;
  if (!playing || compareMode || !motion) return null;
  return <LoopPreviewCanvas motion={motion} fps={fps} smooth={modes[modes.length - 1] === SMOOTH_MODE} />;
};
