import React from "react";

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

export const FieldRow: React.FC<FieldRowProps> = ({ label, children }) => (
  <div className="grid grid-cols-[64px_1fr] items-center gap-2">
    <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">{label}</span>
    {children}
  </div>
);
