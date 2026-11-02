import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { DitherMethod } from "../../../engine/types";
import { DitherMethodList } from "./dither/DitherMethodList";
import { ditherMethodInfo, isErrorDiffusion } from "./dither/dither-methods";

interface AlgorithmPopoverProps {
  ditherMethod: DitherMethod;
  setDitherMethod: (m: DitherMethod) => void;
  ditherFactor: number;
  setDitherFactor: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

interface StrengthControlProps {
  ditherFactor: number;
  setDitherFactor: (v: number) => void;
  onStateChangeFinished: () => void;
}

const STRENGTH_MIN = 0.1;
const STRENGTH_MAX = 2.0;
const STRENGTH_STEP = 0.05;
const PERCENT_SCALE = 100;
const STRENGTH_LABEL = "Diffusion strength";
const STRENGTH_HINT = "How much of each pixel's leftover tone spreads to its neighbours. 100% is the standard look.";
const ORDERED_HINT = "Strength only changes error diffusion methods. Ordered patterns are fixed.";

const StrengthControl: React.FC<StrengthControlProps> = ({ ditherFactor, setDitherFactor, onStateChangeFinished }) => (
  <>
    <div className="grid grid-cols-[1fr_40px] items-center gap-x-2 px-1">
      <Slider
        label={STRENGTH_LABEL}
        min={STRENGTH_MIN}
        max={STRENGTH_MAX}
        step={STRENGTH_STEP}
        value={ditherFactor}
        onChange={setDitherFactor}
        onDone={onStateChangeFinished}
      />
      <EditableValue
        value={ditherFactor}
        min={STRENGTH_MIN}
        max={STRENGTH_MAX}
        step={STRENGTH_STEP}
        scale={PERCENT_SCALE}
        suffix="%"
        onChange={setDitherFactor}
        onCommit={onStateChangeFinished}
      />
    </div>
    <p className="text-[12px] leading-snug text-[var(--s-text-subtle)] px-2 pt-1">{STRENGTH_HINT}</p>
  </>
);

export const AlgorithmPopover: React.FC<AlgorithmPopoverProps> = ({
  ditherMethod,
  setDitherMethod,
  ditherFactor,
  setDitherFactor,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => (
  <Popover onClose={onClose} className="w-64" static={isStatic}>
    <PopoverSection title="Algorithm">
      <div className={isStatic ? "" : "max-h-52 overflow-y-auto"}>
        <DitherMethodList selected={ditherMethod} onSelect={setDitherMethod} />
      </div>
      <p aria-live="polite" className="text-[12px] leading-snug text-[var(--s-text-muted)] px-2 pt-1.5">
        {ditherMethodInfo(ditherMethod)?.description}
      </p>
    </PopoverSection>
    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title={STRENGTH_LABEL}>
      {isErrorDiffusion(ditherMethod) ? (
        <StrengthControl
          ditherFactor={ditherFactor}
          setDitherFactor={setDitherFactor}
          onStateChangeFinished={onStateChangeFinished}
        />
      ) : (
        <p className="text-[12px] leading-snug text-[var(--s-text-subtle)] px-2">{ORDERED_HINT}</p>
      )}
    </PopoverSection>
  </Popover>
);
