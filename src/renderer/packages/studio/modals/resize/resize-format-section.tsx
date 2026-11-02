import React from "react";
import type { ResizeFormatGroup } from "@bitgrain/studio-core/resize-formats/resize-format-groups";
import { ResizeFormatCard } from "./resize-format-card";

interface ResizeFormatSectionProps {
  group: ResizeFormatGroup;
  selected: ReadonlySet<string>;
  sourceWidth: number;
  sourceHeight: number;
  onToggle: (id: string) => void;
}

export const ResizeFormatSection: React.FC<ResizeFormatSectionProps> = ({
  group, selected, sourceWidth, sourceHeight, onToggle,
}) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-[12.5px] font-medium text-[var(--s-text-muted)]">{group.label}</h3>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
      {group.formats.map((format) => (
        <ResizeFormatCard
          key={format.id}
          format={format}
          isSelected={selected.has(format.id)}
          isCurrent={format.width === sourceWidth && format.height === sourceHeight}
          onToggle={onToggle}
        />
      ))}
    </div>
  </section>
);
