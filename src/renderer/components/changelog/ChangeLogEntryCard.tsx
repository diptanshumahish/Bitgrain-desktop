import React from "react";
import type { ChangeLogEntry } from "../../data/change-log";
import { CHANGE_LOG_TYPE_STYLES, formatChangeLogDate } from "./change-log-config";

interface ChangeLogEntryCardProps {
  entry: ChangeLogEntry;
  dense?: boolean;
}

export const ChangeLogEntryCard: React.FC<ChangeLogEntryCardProps> = ({ entry, dense = false }) => {
  const style = CHANGE_LOG_TYPE_STYLES[entry.type];
  const Icon = style.icon;
  const hasItems = !!entry.items && entry.items.length > 0;

  return (
    <div className={`flex gap-3 ${dense ? "py-3" : "py-5"} border-b border-black/5 dark:border-white/5 last:border-0`}>
      <div className="shrink-0 w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center mt-0.5">
        <Icon size={12} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${style.badge}`}>
            {style.label}
          </span>
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
            v{entry.version}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {formatChangeLogDate(entry.date)}
          </span>
        </div>
        <p className={`${dense ? "text-[12px]" : "text-[13px]"} font-medium text-zinc-900 dark:text-zinc-100 mb-1`}>
          {entry.title}
        </p>
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {entry.description}
        </p>
        {hasItems && (
          <ul className="mt-2.5 space-y-1.5">
            {entry.items!.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-[11.5px] text-zinc-500 dark:text-zinc-500 leading-relaxed"
              >
                <span className="mt-[6px] shrink-0 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
