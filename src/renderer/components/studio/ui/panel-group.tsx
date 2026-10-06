import React from "react";

interface PanelGroupProps {
  title: string;
  children: React.ReactNode;
}

export const PanelGroup: React.FC<PanelGroupProps> = ({ title, children }) => (
  <div className="flex flex-col gap-3 px-4 pt-5 pb-2">
    <span className="text-[13px] text-[var(--s-text-muted)] font-medium">
      {title}
    </span>
    <div className="flex flex-col gap-2.5">{children}</div>
  </div>
);
