import React from "react";
import { ArrowRight } from "lucide-react";
import type { BrandIssue } from "./brand-issue";
import { emitBrandFix } from "./brand-fix-events";
import { fontDisplayName } from "../palette/font-family-key";

interface BrandIssueRowProps {
  issue: BrandIssue;
}

const ColorChip: React.FC<{ value: string }> = ({ value }) => (
  <span className="w-3.5 h-3.5 rounded-[4px] border border-[var(--s-border)] shrink-0" style={{ background: value }} />
);

const FontName: React.FC<{ family: string }> = ({ family }) => (
  <span className="max-w-[72px] truncate text-[11px] text-[var(--s-text-muted)]">{fontDisplayName(family)}</span>
);

const IssueChange: React.FC<BrandIssueRowProps> = ({ issue }) =>
  issue.kind === "color" ? (
    <span className="flex items-center gap-1 shrink-0">
      <ColorChip value={issue.value} />
      <ArrowRight size={10} strokeWidth={2} className="text-[var(--s-text-subtle)]" />
      <ColorChip value={issue.fixValue} />
    </span>
  ) : (
    <span className="flex items-center gap-1 min-w-0">
      <FontName family={issue.value} />
      <ArrowRight size={10} strokeWidth={2} className="text-[var(--s-text-subtle)] shrink-0" />
      <FontName family={issue.fixValue} />
    </span>
  );

export const BrandIssueRow: React.FC<BrandIssueRowProps> = ({ issue }) => (
  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--s-bg-input)] transition-colors">
    <div className="flex-1 min-w-0 flex flex-col">
      <span className="text-[12px] text-[var(--s-text)] truncate">{issue.label}</span>
      <span className="text-[11px] text-[var(--s-text-subtle)]">{issue.kind === "color" ? "Color" : "Font"}</span>
    </div>
    <IssueChange issue={issue} />
    <button
      type="button"
      onClick={() => emitBrandFix([issue])}
      className="h-6 px-2 rounded-md text-[11px] font-medium bg-[var(--s-bg-input)] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors shrink-0"
    >
      Fix
    </button>
  </div>
);
