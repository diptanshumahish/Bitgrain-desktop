import React from "react";
import { Group, Shuffle } from "lucide-react";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";

interface MultiSelectPropertiesProps {
  count: number;
  onAlign: (alignment: string) => void;
  onGroup: () => void;
  onScatterCollage?: () => void;
}

export const MultiSelectProperties: React.FC<MultiSelectPropertiesProps> = ({
  count,
  onAlign,
  onGroup,
  onScatterCollage,
}) => (
  <div className="flex flex-col font-editorial">
    <PanelGroup title="Align">
      <AlignRow onAlign={onAlign} />
    </PanelGroup>

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
