import React from "react";
import type { SizeGroup } from "@bitgrain/studio-core/design-sizes/size-groups";
import type { DesignFormat } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import { SizeCard } from "./size-card";

interface SizeGroupSectionProps {
  group: SizeGroup;
  onPick: (format: DesignFormat) => void;
}

export const SizeGroupSection: React.FC<SizeGroupSectionProps> = ({ group, onPick }) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-[12.5px] font-medium text-[var(--s-text-muted)]">{group.label}</h3>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
      {group.formats.map((format) => (
        <SizeCard key={format.id} format={format} onPick={onPick} />
      ))}
    </div>
  </section>
);
