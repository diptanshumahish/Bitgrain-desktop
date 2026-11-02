import React from "react";
import { Minus } from "lucide-react";
import type { PageSafeZone } from "@bitgrain/studio-core/design-sizes/safe-zone-types";
import { ScrubField, SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { useHistoryOnce } from "./use-history-once";

interface GuideBoxRowProps {
  zone: PageSafeZone;
  pageWidth: number;
  pageHeight: number;
  onChange: (patch: Partial<PageSafeZone>, recordHistory: boolean) => void;
  onRemove: () => void;
}

const ICON_SIZE = 12;

export const GuideBoxRow: React.FC<GuideBoxRowProps> = ({ zone, pageWidth, pageHeight, onChange, onRemove }) => {
  const history = useHistoryOnce();
  const update = (patch: Partial<PageSafeZone>): void => onChange(patch, history.takeRecord());
  const field = (label: string, key: "x" | "y" | "width" | "height", total: number): React.ReactElement => (
    <ScrubField
      label={label}
      compact
      value={Math.round(zone[key] * total)}
      min={0}
      max={total}
      onChange={(value) => update({ [key]: value / total })}
      onCommit={history.reset}
    />
  );
  return (
    <div className="flex flex-col gap-1.5 pb-2 border-b border-[var(--s-border)] last:border-b-0">
      <div className="flex items-center gap-1.5">
        <input
          value={zone.label}
          onChange={(event) => update({ label: event.target.value })}
          onBlur={history.reset}
          aria-label="Box name"
          className="h-7 min-w-0 flex-1 rounded-md bg-[var(--s-bg-input)] px-2 text-[12px] text-[var(--s-text)] outline-none focus:ring-1 focus:ring-[var(--s-border-focus)]"
        />
        <SmallBtn title="Remove box" onClick={onRemove}>
          <Minus size={ICON_SIZE} />
        </SmallBtn>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {field("X", "x", pageWidth)}
        {field("Y", "y", pageHeight)}
        {field("W", "width", pageWidth)}
        {field("H", "height", pageHeight)}
      </div>
    </div>
  );
};
