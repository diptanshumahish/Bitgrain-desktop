import React from "react";

interface OptionGroupProps {
  label: string;
  children: React.ReactNode;
}

export const OptionGroup: React.FC<OptionGroupProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="px-0.5 text-[10.5px] font-medium text-[var(--s-text-subtle)]">{label}</span>
    {children}
  </div>
);
