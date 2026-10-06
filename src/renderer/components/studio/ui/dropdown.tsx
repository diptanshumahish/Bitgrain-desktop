import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string;
  style?: React.CSSProperties;
  group?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
  searchable?: boolean;
  icon?: React.ReactNode;
  placement?: "down" | "up";
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select…",
  maxHeight = 240,
  searchable = false,
  icon,
  placement = "down",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const hasGroups = options.some((o) => o.group);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((opt) => opt.label.toLowerCase().includes(normalizedQuery))
    : options;

  const selectOption = (next: string) => {
    onChange(next);
    close();
  };

  const renderOptions = () => {
    if (!hasGroups) {
      return visibleOptions.map((opt) => (
        <OptionBtn key={opt.value} opt={opt} selected={value} onSelect={selectOption} />
      ));
    }

    const rendered: React.ReactNode[] = [];
    let lastGroup: string | undefined = undefined;

    visibleOptions.forEach((opt) => {
      if (opt.group !== lastGroup) {
        lastGroup = opt.group;
        rendered.push(
          <div
            key={`group-${opt.group}`}
            className={`px-2.5 pt-1.5 pb-1 text-[9px] font-bold text-[var(--s-text-subtle)] ${
              rendered.length > 0 ? "border-t border-[var(--s-border)]" : ""
            }`}
          >
            {opt.group}
          </div>,
        );
      }
      rendered.push(
        <OptionBtn key={opt.value} opt={opt} selected={value} onSelect={selectOption} />,
      );
    });

    return rendered;
  };

  return (
    <div ref={ref} className="relative font-editorial">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={`w-full flex items-center justify-between gap-1.5 px-2 py-1.5 bg-[var(--s-bg-input)] border-none rounded-md cursor-pointer text-[11px] font-inherit text-[var(--s-text)] transition-all duration-100 ${
          open ? "ring-1.5 ring-[var(--s-accent)]" : "ring-0"
        }`}
        style={selected?.style}
      >
        {icon && (
          <span className="shrink-0 text-[var(--s-text-muted)] flex items-center">
            {icon}
          </span>
        )}
        <span className="flex-1 text-left truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`shrink-0 text-[var(--s-text-muted)] transition-transform duration-150 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-lg z-[200] overflow-y-auto ${
            placement === "up" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"
          }`}
          style={{ maxHeight }}
        >
          {searchable && (
            <div className="sticky top-0 z-10 bg-[var(--s-bg-panel)] p-1.5 border-b border-[var(--s-border)]">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded">
                <Search size={11} strokeWidth={1.5} className="shrink-0 text-[var(--s-text-muted)]" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search fonts"
                  className="w-full bg-transparent border-none text-[11px] text-[var(--s-text)] focus:outline-none"
                />
              </div>
            </div>
          )}
          {visibleOptions.length === 0 ? (
            <div className="px-2.5 py-3 text-center text-[10px] text-[var(--s-text-subtle)]">
              No fonts found
            </div>
          ) : (
            renderOptions()
          )}
        </div>
      )}
    </div>
  );
};

const OptionBtn: React.FC<{
  opt: DropdownOption;
  selected: string;
  onSelect: (v: string) => void;
}> = ({ opt, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(opt.value)}
    className={`block w-full px-2.5 py-1.5 text-left text-[11px] font-inherit cursor-pointer border-none transition-all duration-100 ${
      opt.value === selected
        ? "bg-[var(--s-selection)] text-[var(--s-accent)] font-semibold"
        : "bg-transparent text-[var(--s-text)] font-normal hover:bg-[var(--s-bg-input)]"
    }`}
    style={opt.style}
  >
    {opt.label}
  </button>
);
