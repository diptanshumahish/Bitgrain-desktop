import React from "react";

interface AdvancedSectionProps {
  children: React.ReactNode;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({ children }) => (
  <details className="group/disclosure">
    <summary className="cursor-pointer select-none list-none px-2 py-1 text-[12px] font-semibold text-[var(--s-text-subtle)] hover:text-[var(--s-text)]">
      <span className="inline-block transition-transform group-open/disclosure:rotate-90 mr-1">›</span>
      Advanced
    </summary>
    <div className="flex flex-col gap-2 pt-1.5 pb-0.5">{children}</div>
  </details>
);
