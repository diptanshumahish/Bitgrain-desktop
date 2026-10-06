import React, { useRef, useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import { CHANGE_LOG } from "../../data/change-log";
import type { ChangeLogEntry, ChangeLogType } from "../../data/change-log";
import { ChangeLogEntryCard } from "./ChangeLogEntryCard";
import { CHANGE_LOG_TYPE_STYLES, CHANGE_LOG_TYPE_ORDER } from "./change-log-config";

interface ChangeLogViewProps {
  limit?: number;
  showFilters?: boolean;
  dense?: boolean;
  emptyMessage?: string;
  className?: string;
}

const DEFAULT_EMPTY_MESSAGE = "Nothing matches this filter yet.";

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({
  limit,
  showFilters = true,
  dense = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  className = "",
}) => {
  const [activeType, setActiveType] = useState<ChangeLogType | "all">("all");

  const filtered: ChangeLogEntry[] =
    activeType === "all"
      ? CHANGE_LOG
      : CHANGE_LOG.filter((entry) => entry.type === activeType);

  const visible = typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  const truncatedCount = filtered.length - visible.length;

  return (
    <div className={className}>
      {showFilters && (
        <ChangeLogFilters activeType={activeType} onChange={setActiveType} />
      )}

      {visible.length === 0 ? (
        <p className="text-[12px] text-zinc-400 dark:text-zinc-500 py-6 text-center">
          {emptyMessage}
        </p>
      ) : (
        <div>
          {visible.map((entry) => (
            <ChangeLogEntryCard key={entry.commit} entry={entry} dense={dense} />
          ))}
        </div>
      )}

      {truncatedCount > 0 && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 text-center">
          {truncatedCount} more {truncatedCount === 1 ? "entry" : "entries"} hidden
        </p>
      )}
    </div>
  );
};

interface ChangeLogFiltersProps {
  activeType: ChangeLogType | "all";
  onChange: (type: ChangeLogType | "all") => void;
}

const ChangeLogFilters: React.FC<ChangeLogFiltersProps> = ({ activeType, onChange }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2 pb-3 mb-1 border-b border-black/5 dark:border-white/5">
      <FilterIcon size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={1.75} />
      <div ref={scrollerRef} className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <FilterChip
          label="All"
          active={activeType === "all"}
          onClick={() => onChange("all")}
        />
        {CHANGE_LOG_TYPE_ORDER.map((type) => (
          <FilterChip
            key={type}
            label={CHANGE_LOG_TYPE_STYLES[type].label}
            active={activeType === type}
            onClick={() => onChange(type)}
          />
        ))}
      </div>
    </div>
  );
};

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded text-[10.5px] font-medium border whitespace-nowrap transition-colors ${
      active
        ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
        : "bg-transparent text-zinc-500 dark:text-zinc-400 border-black/10 dark:border-white/10 hover:text-zinc-900 dark:hover:text-zinc-100"
    }`}
  >
    {label}
  </button>
);
