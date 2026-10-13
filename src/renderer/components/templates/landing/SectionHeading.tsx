import React from "react";

interface SectionHeadingProps {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, meta, action }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div className="flex items-baseline gap-3">
      <h2 className="text-[20px] font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      {meta && <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500">{meta}</span>}
    </div>
    {action}
  </div>
);
