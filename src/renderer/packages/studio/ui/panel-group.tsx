import React from "react";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";

interface PanelGroupProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  onTitleClick?: () => void;
  anchor?: string;
}


export const PanelGroup: React.FC<PanelGroupProps> = ({ title, actions, children, onTitleClick, anchor }) => (
  <div data-panel-anchor={anchor} className="flex flex-col gap-3 px-4 pt-5 pb-2 scroll-mt-2">
    <div className="flex items-center justify-between">
      {onTitleClick ? (
        <button type="button" onClick={onTitleClick} className={`${SECTION_TITLE_CLASS} flex-1 text-left hover:text-[var(--s-text-muted)] transition-colors`}>
          {title}
        </button>
      ) : (
        <span className={SECTION_TITLE_CLASS}>{title}</span>
      )}
      {actions && <div className="flex items-center gap-0.5">{actions}</div>}
    </div>
    {children ? <div className="flex flex-col gap-2.5">{children}</div> : null}
  </div>
);
