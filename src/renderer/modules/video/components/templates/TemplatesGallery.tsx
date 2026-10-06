import React, { useState } from "react";
import { ReelsTab } from "./tabs/ReelsTab";
import { TitlesTab } from "./tabs/TitlesTab";
import { OverlaysTab } from "./tabs/OverlaysTab";
import { ProjectTab } from "./tabs/ProjectTab";
import { TransitionsTab } from "./tabs/TransitionsTab";
import { BeatSyncTab } from "./tabs/BeatSyncTab";

type TabId = "reels" | "titles" | "overlays" | "project" | "transitions" | "beats";

interface TabSpec {
  id: TabId;
  label: string;
}

const TABS: TabSpec[] = [
  { id: "reels", label: "Reels" },
  { id: "titles", label: "Titles" },
  { id: "overlays", label: "Overlays" },
  { id: "project", label: "Project" },
  { id: "transitions", label: "Trans" },
  { id: "beats", label: "Beats" },
];

const TAB_BODY: Record<TabId, React.FC> = {
  reels: ReelsTab,
  titles: TitlesTab,
  overlays: OverlaysTab,
  project: ProjectTab,
  transitions: TransitionsTab,
  beats: BeatSyncTab,
};

export const TemplatesGallery: React.FC = () => {
  const [active, setActive] = useState<TabId>("reels");
  const Body = TAB_BODY[active];

  return (
    <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl w-[360px] max-h-[460px] flex flex-col font-editorial overflow-hidden">
      <div className="flex items-center gap-0.5 p-1 border-b border-[var(--s-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 h-7 rounded-md text-[10.5px] font-medium transition-colors ${
              active === tab.id
                ? "bg-[var(--s-bg-input-hover)] text-[var(--s-text)]"
                : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <Body />
      </div>
    </div>
  );
};
