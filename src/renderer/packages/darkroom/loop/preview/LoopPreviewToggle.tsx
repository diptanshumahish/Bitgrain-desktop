import React from "react";
import { Repeat } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";
import { useLoopMotion } from "../use-loop-motion";
import { loopPreviewSignal, toggleLoopPreview } from "./loop-preview-store";

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;
const PLAY_LABEL = "Preview a moving loop";
const STOP_LABEL = "Stop the loop preview";
const UNAVAILABLE_LABEL = "Add film grain, paper, dither, halftone or pop art to preview a loop";

export const LoopPreviewToggle: React.FC = () => {
  const playing = useSignalValue(loopPreviewSignal);
  const hasMotion = useLoopMotion().motion !== null;
  const label = !hasMotion ? UNAVAILABLE_LABEL : playing ? STOP_LABEL : PLAY_LABEL;

  return (
    <TopBarButton label={label} text="Loop" pressed={playing && hasMotion} disabled={!hasMotion} onClick={toggleLoopPreview}>
      <Repeat size={ICON_SIZE} strokeWidth={ICON_STROKE} />
    </TopBarButton>
  );
};
