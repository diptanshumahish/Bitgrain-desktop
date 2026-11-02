import React from "react";
import { Search } from "lucide-react";
import { trackEvent } from "../../../lib/tracker";

interface TemplatesEmptyStateProps {
  query: string;
  tags: string[];
  onPick: (tag: string) => void;
}

const TAG_LIMIT = 10;
const SUGGESTED_SEARCHES = [
  "poster",
  "instagram",
  "resume",
  "wedding",
  "menu",
  "youtube",
  "business card",
];

export const TemplatesEmptyState: React.FC<TemplatesEmptyStateProps> = ({
  query,
  tags,
  onPick,
}) => {
  const suggestions = (tags.length > 0 ? tags : SUGGESTED_SEARCHES).slice(
    0,
    TAG_LIMIT,
  );
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
        <Search size={24} />
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {query ? `Nothing matches "${query}" yet` : "Nothing here yet"}
      </p>
      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
            Try one of these
          </p>
          <div className="mx-auto flex max-w-[480px] flex-wrap justify-center gap-1.5">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  trackEvent("templates", "search_suggestion_clicked", {
                    details: { tag },
                  });
                  onPick(tag);
                }}
                className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
