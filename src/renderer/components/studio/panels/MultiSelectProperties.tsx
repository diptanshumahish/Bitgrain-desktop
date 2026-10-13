import React from "react";
import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Group, Shuffle } from "lucide-react";
import type { DistributeAxis } from "../../../pages/studio-page/layer-order";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";

interface MultiSelectPropertiesProps {
  count: number;
  onAlign: (alignment: string) => void;
  onGroup: () => void;
  onScatterCollage?: () => void;
  onDistribute?: (axis: DistributeAxis) => void;
}

const MIN_DISTRIBUTE_COUNT = 3;
const SECONDARY_BUTTON =
  "flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md bg-[var(--s-bg-input)] text-[var(--s-text)] text-[11px] font-medium hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const DistributeRow: React.FC<{ enabled: boolean; onDistribute: (axis: DistributeAxis) => void }> = ({
  enabled,
  onDistribute,
}) => (
  <div className="flex gap-1.5" title={enabled ? undefined : "Select three or more layers to distribute"}>
    <button type="button" disabled={!enabled} onClick={() => onDistribute("horizontal")} className={SECONDARY_BUTTON}>
      <AlignHorizontalSpaceAround size={13} strokeWidth={1.75} />
      Horizontally
    </button>
    <button type="button" disabled={!enabled} onClick={() => onDistribute("vertical")} className={SECONDARY_BUTTON}>
      <AlignVerticalSpaceAround size={13} strokeWidth={1.75} />
      Vertically
    </button>
  </div>
);

export const MultiSelectProperties: React.FC<MultiSelectPropertiesProps> = ({
  count,
  onAlign,
  onGroup,
  onScatterCollage,
  onDistribute,
}) => (
  <div className="flex flex-col font-editorial">
    <PanelGroup title="Align">
      <AlignRow onAlign={onAlign} />
    </PanelGroup>

    {onDistribute && (
      <PanelGroup title="Distribute">
        <DistributeRow enabled={count >= MIN_DISTRIBUTE_COUNT} onDistribute={onDistribute} />
      </PanelGroup>
    )}

    <PanelGroup title="Arrange">
      <button
        type="button"
        onClick={onGroup}
        className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[11.5px] font-medium hover:opacity-90 transition-opacity"
      >
        <Group size={14} strokeWidth={1.75} />
        Group {count} layers
      </button>

      {onScatterCollage && (
        <button
          type="button"
          onClick={onScatterCollage}
          className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-[var(--s-bg-input)] text-[var(--s-text)] text-[11.5px] font-medium hover:bg-[var(--s-bg-input-hover)] transition-colors"
        >
          <Shuffle size={14} strokeWidth={1.75} />
          Scatter into collage
        </button>
      )}
    </PanelGroup>
  </div>
);
