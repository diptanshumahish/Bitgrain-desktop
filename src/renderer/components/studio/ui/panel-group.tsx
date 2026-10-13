import React from "react";

interface PanelGroupProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PanelGroup: React.FC<PanelGroupProps> = ({ title, actions, children }) => (
  <div className="flex flex-col gap-3 px-4 pt-5 pb-2">
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--s-text-muted)] font-medium">
        {title}
      </span>
      {actions && <div className="flex items-center gap-0.5">{actions}</div>}
    </div>
    {children ? <div className="flex flex-col gap-2.5">{children}</div> : null}
  </div>
);
