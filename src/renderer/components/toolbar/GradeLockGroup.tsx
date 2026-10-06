import React from "react";

interface GradeLockGroupProps {
  locked: boolean;
  mobile?: boolean;
  children: React.ReactNode;
}

export const GradeLockGroup: React.FC<GradeLockGroupProps> = ({
  locked,
  mobile = false,
  children,
}) => (
  <div className={`relative ${mobile ? "flex items-center shrink-0" : ""} group/grade`}>
    <div
      className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
        locked ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      {children}
    </div>
    {locked && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/grade:block z-[60] pointer-events-none">
        <div className="bg-[var(--s-border-strong)] text-[var(--s-bg-panel)] text-[9px] font-medium px-2 py-1 rounded-md whitespace-nowrap leading-tight">
          Remove color grade to edit effects
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[4px] border-transparent border-t-[var(--s-border-strong)]" />
      </div>
    )}
  </div>
);
