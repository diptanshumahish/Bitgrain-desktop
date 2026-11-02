import React from "react";
import { INK_MARKS, type InkMarkKind } from "../ink/ink-marks";

interface WelcomeWordProps {
  word: string;
  mark: InkMarkKind | null;
  markStartMs: number;
}

export const WelcomeWord: React.FC<WelcomeWordProps> = ({ word, mark, markStartMs }) => {
  const wordSpan = (
    <span data-word aria-hidden="true" className="inline-block">
      {word}
    </span>
  );
  if (!mark) return wordSpan;
  const Mark = INK_MARKS[mark];
  return <Mark startMs={markStartMs}>{wordSpan}</Mark>;
};
