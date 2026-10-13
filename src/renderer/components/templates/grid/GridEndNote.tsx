import React from "react";

export const GridEndNote: React.FC<{ total: number }> = ({ total }) => (
  <div className="flex items-center gap-4 py-10">
    <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500">
      That's everything here, {total} {total === 1 ? "template" : "templates"} in all
    </span>
    <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
  </div>
);
