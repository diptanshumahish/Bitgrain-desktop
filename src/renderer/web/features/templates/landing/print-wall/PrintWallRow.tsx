import React from "react";
import type { WallPrint } from "./print-wall-prints";
import { PinnedPrint } from "./PinnedPrint";

interface PrintWallRowProps {
  prints: readonly WallPrint[];
  isReversed: boolean;
  heightClass: string;
}

const LOOP_COPIES = [0, 1];

export const PrintWallRow: React.FC<PrintWallRowProps> = ({ prints, isReversed, heightClass }) => (
  <div className={`print-wall-track flex w-max py-7 ${isReversed ? "print-wall-track-reverse" : ""}`}>
    {LOOP_COPIES.map((copy) =>
      prints.map((print, index) => (
        <PinnedPrint key={`${copy}-${index}-${print.key}`} print={print} index={index} heightClass={heightClass} />
      )),
    )}
  </div>
);
