import React from "react";
import { ArrowLeft } from "lucide-react";
import type { InspectorPanel } from "../toolbar-types";
import { useEditorLayout } from "../panel-state/editor-layout-store";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";

const INSPECTOR_TABS: readonly { panel: InspectorPanel; label: string }[] = [
  { panel: "effects", label: "Look" },
  { panel: "tone", label: "Tone" },
  { panel: "colour", label: "Colour" },
];

const BACK_TARGETS: Partial<Record<InspectorPanel, InspectorPanel>> = { palette: "colour", lut: "colour" };

interface InspectorHeaderProps {
  panel: InspectorPanel;
  title: string;
  onSelect: (panel: InspectorPanel) => void;
}

const TAB_ACTIVE = "bg-[var(--s-bg-input)] text-[var(--s-text)] border-[var(--s-border)]";
const TAB_IDLE = "border-transparent text-[var(--s-text-muted)] hover:text-[var(--s-text)]";

const CompactHeader: React.FC<InspectorHeaderProps> = ({ panel, title, onSelect }) => {
  const isTab = INSPECTOR_TABS.some((tab) => tab.panel === panel);
  if (!isTab) {
    const back = BACK_TARGETS[panel] ?? "effects";
    return (
      <div className="h-12 shrink-0 flex items-center gap-1 px-2 border-b border-[var(--s-border)]">
        <button type="button" onClick={() => onSelect(back)} aria-label="Back"
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]">
          <ArrowLeft size={14} strokeWidth={1.75} />
        </button>
        <span className={SECTION_TITLE_CLASS}>{title}</span>
      </div>
    );
  }
  return (
    <div role="tablist" aria-label="Inspector" className="h-12 shrink-0 grid grid-cols-3 gap-1 items-center px-2 border-b border-[var(--s-border)]">
      {INSPECTOR_TABS.map((tab) => (
        <button key={tab.panel} type="button" role="tab" aria-selected={tab.panel === panel} onClick={() => onSelect(tab.panel)}
          className={`h-8 rounded-md border text-[13px] font-semibold transition-colors ${tab.panel === panel ? TAB_ACTIVE : TAB_IDLE}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

interface TitleHeaderProps {
  title: string;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ title }) => (
  <div className="h-12 shrink-0 flex items-center px-4 border-b border-[var(--s-border)]">
    <h2 className={SECTION_TITLE_CLASS}>{title}</h2>
  </div>
);

export const InspectorHeader: React.FC<InspectorHeaderProps> = (props) =>
  useEditorLayout() === "recipe" ? <TitleHeader title={props.title} /> : <CompactHeader {...props} />;
