import React from "react";
import { Search, X } from "lucide-react";

interface TemplateSearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export const TemplateSearchInput: React.FC<TemplateSearchInputProps> = ({
  value,
  placeholder,
  onChange,
  onBlur,
}) => (
  <div className="group relative w-full">
    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100">
      <Search size={16} strokeWidth={2.5} />
    </div>
    <input
      type="search"
      aria-label="Search templates"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-11 text-[14px] font-medium text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-white/5 [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange("")}
        className="absolute inset-y-0 right-3 flex items-center px-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    )}
  </div>
);
