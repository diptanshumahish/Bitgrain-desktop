import React from "react";
import { Search, X } from "lucide-react";

interface MarineSearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export const MarineSearchInput: React.FC<MarineSearchInputProps> = ({ value, placeholder, onChange, onBlur }) => (
  <div className="group relative w-full">
    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ultramarine/50 transition-colors group-focus-within:text-ultramarine app-dark:text-apricot/60">
      <Search size={16} strokeWidth={2.25} />
    </div>
    <input
      type="search"
      aria-label="Search templates"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className="w-full rounded-xl border border-ultramarine/15 bg-white py-3 pl-11 pr-11 font-display text-[15px] text-ink-soft transition-colors placeholder:text-ink-soft/45 focus:border-ultramarine focus:outline-none app-dark:border-white/10 app-dark:bg-white/5 app-dark:text-white app-dark:placeholder:text-white/35 app-dark:focus:border-apricot [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange("")}
        className="absolute inset-y-0 right-3 flex items-center px-1 text-ultramarine/50 hover:text-ultramarine"
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    )}
  </div>
);
