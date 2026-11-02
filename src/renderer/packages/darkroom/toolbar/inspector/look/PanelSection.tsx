import React from "react";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";

interface PanelSectionProps {
  title: string;
  action?: React.ReactNode;
  flush?: boolean;
  children: React.ReactNode;
}

export const PanelSection: React.FC<PanelSectionProps> = ({ title, action, flush = false, children }) => (
  <section className={`${flush ? "" : "px-3"} py-3 border-b border-[var(--s-border)] last:border-b-0`}>
    <header className={`flex items-center justify-between min-h-6 mb-2 ${flush ? "px-3.5" : "px-1"}`}>
      <h3 className={SECTION_TITLE_CLASS}>{title}</h3>
      {action}
    </header>
    {children}
  </section>
);
