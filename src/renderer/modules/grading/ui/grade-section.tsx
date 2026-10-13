import React from "react";
import { ChevronDown } from "lucide-react";

interface GradeSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const GradeSection: React.FC<GradeSectionProps> = ({ title, defaultOpen = false, children }) => (
  <details open={defaultOpen} className="group border-t border-[var(--s-border)] first:border-t-0">
    <summary className="flex items-center justify-between py-2.5 cursor-pointer list-none select-none text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown size={13} strokeWidth={2} className="transition-transform group-open:rotate-180" />
    </summary>
    <div className="flex flex-col gap-3 pb-4">{children}</div>
  </details>
);
