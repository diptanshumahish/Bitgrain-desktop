import React from "react";

interface ExportSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ title, children }) => (
  <details className="group">
    <summary className="list-none cursor-pointer select-none flex items-center gap-1.5 px-2 h-8 rounded-md text-[12px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]">
      <span className="inline-block transition-transform group-open:rotate-90">›</span>
      {title}
    </summary>
    <div className="flex flex-col pb-1">{children}</div>
  </details>
);
