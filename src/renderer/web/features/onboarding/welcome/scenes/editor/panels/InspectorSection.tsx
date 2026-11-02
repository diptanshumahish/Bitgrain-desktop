import React from "react";

interface InspectorSectionProps {
  title: string;
  active: boolean;
  children: React.ReactNode;
}

export const InspectorSection: React.FC<InspectorSectionProps> = ({ title, active, children }) => (
  <section className={`flex flex-col gap-2 rounded-lg p-2.5 transition-colors duration-300 ${active ? "bg-violet-500/10 ring-1 ring-violet-500/40" : "ring-1 ring-transparent"}`}>
    <p className="text-[11px] text-white/45">{title}</p>
    {children}
  </section>
);
