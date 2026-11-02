import React from "react";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";
import { LabeledSlider } from "@bitgrain/ui/controls/toolbar/controls/LabeledSlider";
import type { ToolbarState } from "../../use-toolbar-state";

const PERCENT_SCALE = 100;
const STRENGTH_STEP = 0.05;

interface PaperTextureProps {
  state: ToolbarState;
}

export const PaperTexture: React.FC<PaperTextureProps> = ({ state: s }) => (
  <div className="flex flex-col gap-1.5 px-2 py-2 border-t border-[var(--s-border)]">
    <ToggleRow label="Paper texture" hint="Paper grain, ink tone, soft edges" checked={s.printFinish}
      onChange={() => { s.setPrintFinish(!s.printFinish); s.onDone(); }} />
    {s.printFinish && (
      <LabeledSlider label="Strength" value={s.printFinishStrength} min={0} max={1} step={STRENGTH_STEP}
        scale={PERCENT_SCALE} suffix="%" onChange={s.setPrintFinishStrength} onCommit={s.onDone} />
    )}
  </div>
);
