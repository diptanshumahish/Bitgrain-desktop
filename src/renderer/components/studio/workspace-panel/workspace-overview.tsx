import React from "react";
import { WorkspaceArt } from "./workspace-art";

interface WorkspaceOverviewProps {
  pageCount: number;
  layerCount: number;
}

interface OverviewStatProps {
  value: number;
  label: string;
}

const OverviewStat: React.FC<OverviewStatProps> = ({ value, label }) => (
  <div className="px-3 py-2.5 flex flex-col gap-0.5">
    <span className="text-[18px] leading-none font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums]">
      {value}
    </span>
    <span className="text-[10.5px] text-[var(--s-text-subtle)]">{label}</span>
  </div>
);

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ pageCount, layerCount }) => (
  <div className="px-4 pt-4">
    <div className="rounded-xl border border-[var(--s-border)] overflow-hidden">
      <div className="h-16 bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]">
        <WorkspaceArt />
      </div>
      <div className="grid grid-cols-2 divide-x divide-[var(--s-border)]">
        <OverviewStat value={pageCount} label={pageCount === 1 ? "Page" : "Pages"} />
        <OverviewStat value={layerCount} label={layerCount === 1 ? "Layer" : "Layers"} />
      </div>
    </div>
  </div>
);
