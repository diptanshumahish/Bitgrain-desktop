import React from "react";

interface ExportGroupProps {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export const ExportGroup: React.FC<ExportGroupProps> = ({ label, aside, children }) => (
  <section className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[12px] font-medium text-[var(--s-text-muted)]">{label}</h3>
      {aside}
    </div>
    {children}
  </section>
);
