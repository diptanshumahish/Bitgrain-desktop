import React from "react";
import { Search } from "lucide-react";
import { trackEvent } from "@bitgrain/platform/tracker";

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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-apricot text-ultramarine">
        <Search size={24} />
      </div>
      <p className="font-display text-[20px] font-medium tracking-[-0.02em] text-ultramarine dark:text-white">
        {query ? `Nothing matches "${query}" yet` : "Nothing here yet"}
      </p>
      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[14px] text-ink-soft/65 dark:text-white/60">
            Try one of these
          </p>
          <div className="mx-auto flex max-w-[480px] flex-wrap justify-center gap-2">
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
                className="rounded-xl border border-ultramarine/15 bg-white px-3.5 py-1.5 text-[14px] font-medium text-ultramarine transition-colors hover:border-ultramarine dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/40"
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
