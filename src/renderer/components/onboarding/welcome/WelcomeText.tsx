import React, { useRef } from "react";
import { useStaggerReveal } from "./hooks/use-stagger-reveal";
import { WORD_DURATION_MS, WORD_STEP_MS } from "./welcome-timing";

const WORD_KEYFRAMES: Keyframe[] = [
  { opacity: 0, filter: "blur(14px)", transform: "translateY(0.3em)" },
  { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
];

interface WelcomeTextProps {
  text: string;
  startMs: number;
}

export const WelcomeText: React.FC<WelcomeTextProps> = ({ text, startMs }) => {
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
          <span data-word aria-hidden="true" className="inline-block">
            {word}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
};
