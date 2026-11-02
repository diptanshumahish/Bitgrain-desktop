import React from "react";
import { useOffscreenPause } from "@bitgrain/ui/hooks/use-offscreen-pause";
import type { WallPrint } from "./print-wall-prints";
import { PrintWallRow } from "./PrintWallRow";
import { PrintRuler } from "./PrintRuler";
import "./print-wall.css";

interface PrintWallBandProps {
  rows: readonly (readonly WallPrint[])[];
  heightClass: string;
}

export const PrintWallBand: React.FC<PrintWallBandProps> = ({ rows, heightClass }) => {
  const observeOffscreen = useOffscreenPause();
  return (
    <div ref={observeOffscreen} aria-hidden="true" className="print-wall relative w-full bg-paper">
      <PrintRuler ticksAt="bottom" />
      <div className="overflow-hidden py-2">
        {rows.map((prints, rowIndex) => (
          <PrintWallRow key={rowIndex} prints={prints} isReversed={rowIndex % 2 === 1} heightClass={heightClass} />
        ))}
      </div>
      <PrintRuler ticksAt="top" />
    </div>
  );
};
