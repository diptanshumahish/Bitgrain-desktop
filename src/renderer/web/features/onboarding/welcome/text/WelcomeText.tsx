import React, { useRef } from "react";
import { useStaggerReveal } from "../hooks/use-stagger-reveal";
import { WORD_DURATION_MS, WORD_STEP_MS } from "../welcome-timing";
import { INK_AFTER_WORD_MS } from "../ink/ink-timing";
import type { InkMarkKind } from "../ink/ink-marks";
import { WelcomeWord } from "./WelcomeWord";

const WORD_KEYFRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(6px)", transform: "translateY(0.4em) rotate(-3deg)" },
  { opacity: 1, filter: "blur(0px)", transform: "translateY(0) rotate(0deg)" },
];

interface WelcomeInk {
  word: string;
  mark: InkMarkKind;
}

interface WelcomeTextProps {
  text: string;
  startMs: number;
  ink?: WelcomeInk;
}

export const WelcomeText: React.FC<WelcomeTextProps> = ({ text, startMs, ink }) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useStaggerReveal(rootRef, {
    selector: "[data-word]",
    keyframes: WORD_KEYFRAMES,
    startMs,
    stepMs: WORD_STEP_MS,
    durationMs: WORD_DURATION_MS,
  });

  return (
    <span ref={rootRef}>
      <span className="sr-only">{text}</span>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          {index > 0 && " "}
          <WelcomeWord
            word={word}
            mark={ink?.word === word ? ink.mark : null}
            markStartMs={startMs + index * WORD_STEP_MS + INK_AFTER_WORD_MS}
          />
        </React.Fragment>
      ))}
    </span>
  );
};
