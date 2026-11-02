import React from "react";
import { Check } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { studioPagesSignal } from "../../state/studio-document-store";
import { useActiveKit } from "../../state/design-kits-store";
import { scanBrand } from "./scan-brand";
import { emitBrandFix } from "./brand-fix-events";
import { BrandIssueRow } from "./brand-issue-row";

const MAX_LISTED_ISSUES = 60;

const AllClear: React.FC<{ kitName: string }> = ({ kitName }) => (
  <div className="flex items-center gap-2 px-3 py-4 text-[12px] text-[var(--s-text-muted)]">
    <Check size={14} strokeWidth={2.25} className="text-[var(--s-accent)] shrink-0" />
    Every color and font matches {kitName}.
  </div>
);

export const BrandCheckPopover: React.FC = () => {
  const pages = useSignalValue(studioPagesSignal);
  const kit = useActiveKit();
  const report = scanBrand(pages, kit);
  if (!kit) return null;
  const listed = report.issues.slice(0, MAX_LISTED_ISSUES);
  const hiddenCount = report.issues.length - listed.length;

  return (
    <div className="w-[320px] bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1 flex flex-col font-editorial">
      <div className="flex items-center gap-2 px-2 pt-1.5 pb-2 border-b border-[var(--s-border)]">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-[12px] font-semibold text-[var(--s-text)]">Brand check</span>
          <span className="text-[11px] text-[var(--s-text-subtle)] truncate">Compared with {kit.name}</span>
        </div>
        {report.issues.length > 0 && (
          <button
            type="button"
            onClick={() => emitBrandFix(report.issues)}
            className="h-6 px-2.5 rounded-md text-[11px] font-medium bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90 transition-opacity"
          >
            Fix all
          </button>
        )}
      </div>
      {report.issues.length === 0 ? (
        <AllClear kitName={kit.name} />
      ) : (
        <div className="max-h-[50vh] overflow-y-auto no-scrollbar py-1">
          {listed.map((issue) => (
            <BrandIssueRow key={issue.key} issue={issue} />
          ))}
          {hiddenCount > 0 && (
            <p className="px-2 py-1.5 text-[11px] text-[var(--s-text-subtle)]">
              And {hiddenCount} more. Fix all covers them too.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
