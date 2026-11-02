import React from "react";
import type { ChangeLogEntry } from "./entries";
import { CHANGE_LOG_TYPE_STYLES, formatChangeLogDate } from "./change-log-config";

interface ChangeLogEntryCardProps {
  entry: ChangeLogEntry;
  dense?: boolean;
}

const MinimalChangeLogEntry: React.FC<{ entry: ChangeLogEntry }> = ({ entry }) => {
  const style = CHANGE_LOG_TYPE_STYLES[entry.type];
  return (
    <div className="py-3 border-b border-black/5 dark:border-white/5 last:border-0">
      <div className="flex items-baseline gap-3">
        <span className="shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500 w-20">
          {formatChangeLogDate(entry.date)}
        </span>
        <p className="flex-1 min-w-0 text-[13px] text-zinc-800 dark:text-zinc-200 truncate">
          {entry.title}
        </p>
        <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
          {style.label}
        </span>
      </div>
    </div>
  );
};

const FullChangeLogEntry: React.FC<{ entry: ChangeLogEntry }> = ({ entry }) => {
  const style = CHANGE_LOG_TYPE_STYLES[entry.type];
  const Icon = style.icon;
  const hasItems = !!entry.items && entry.items.length > 0;
  return (
    <div className="flex gap-3 py-5 border-b border-black/5 dark:border-white/5 last:border-0">
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
        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 mb-1">
          {entry.title}
        </p>
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400  ">
          {entry.description}
        </p>
        {hasItems && (
          <ul className="mt-2.5 space-y-1.5">
            {entry.items!.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-[11.5px] text-zinc-500 dark:text-zinc-500  "
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

export const ChangeLogEntryCard: React.FC<ChangeLogEntryCardProps> = ({ entry, dense = false }) => {
  if (dense) return <MinimalChangeLogEntry entry={entry} />;
  return <FullChangeLogEntry entry={entry} />;
};
