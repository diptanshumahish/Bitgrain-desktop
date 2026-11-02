import React from "react";
import { Minus } from "lucide-react";
import type { PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";
import { ScrubField, SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { useHistoryOnce } from "./use-history-once";

interface GuideLineRowProps {
  guide: PageGuide;
  max: number;
  onMove: (position: number, recordHistory: boolean) => void;
  onRemove: () => void;
}

const ICON_SIZE = 12;

export const GuideLineRow: React.FC<GuideLineRowProps> = ({ guide, max, onMove, onRemove }) => {
  const history = useHistoryOnce();
  const vertical = guide.axis === "x";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1">
        <ScrubField
          label={vertical ? "X" : "Y"}
          title={vertical ? "Vertical line, distance from the left edge" : "Horizontal line, distance from the top edge"}
          value={guide.position}
          min={0}
          max={max}
          suffix="px"
          onChange={(position) => onMove(Math.round(position), history.takeRecord())}
          onCommit={history.reset}
        />
      </div>
      <SmallBtn title="Remove line" onClick={onRemove}>
        <Minus size={ICON_SIZE} />
      </SmallBtn>
    </div>
  );
};
