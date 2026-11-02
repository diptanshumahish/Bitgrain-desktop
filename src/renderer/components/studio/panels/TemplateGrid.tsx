import React, { useState, useCallback, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, History } from "lucide-react";
import type { TemplateDef } from "../../../data/studioTypes";
import { userSignal } from "../../../hooks/useAuth";
import { useSignalValue } from "../../../lib/signal";
import { emitModal } from "../../../lib/event-bus";
import {
  templatesSignal,
  templatesLoadingSignal,
  templatesHasMoreSignal,
  loadMoreTemplates,
  loadTemplates,
} from "../../../store/templates-store";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { trackEvent } from "../../../lib/tracker";
import { trackTemplateClick } from "../../../modules/tracking/track-template-click";
import { StudioThumbGrid } from "./template-grid/StudioThumbGrid";
import { CategorySection } from "./template-grid/CategorySection";
import { TemplatesNetworkNotice } from "../../templates/network/TemplatesNetworkNotice";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { fetchFullTemplate } from "../../../lib/template-cards/full-template-cache";

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "album", label: "Album" },
  { key: "poster", label: "Poster" },
  { key: "wallpaper", label: "Wallpaper" },
  { key: "social", label: "Social" },
  { key: "frame", label: "Frame" },
  { key: "invitation", label: "Invitation" },
  { key: "certificate", label: "Certificate" },
  { key: "id-card", label: "ID card" },
  { key: "grade-card", label: "Grade card" },
  { key: "grand-opening", label: "Grand opening" },
  { key: "letterhead", label: "Letterhead" },
  { key: "menu", label: "Menu" },
  { key: "business-card", label: "Business card" },
  { key: "flyer", label: "Flyer" },
  { key: "book-cover", label: "Book cover" },
  { key: "thumbnail", label: "Thumbnail" },
  { key: "banner", label: "Banner" },
  { key: "planner", label: "Planner" },
  { key: "packaging", label: "Packaging" },
  { key: "app-screenshot", label: "App screenshot" },
  { key: "business-docs", label: "Business docs" },
  { key: "sports", label: "Sports" },
  { key: "stream-kit", label: "Stream kit" },
  { key: "signage", label: "Signage" },
  { key: "ticket", label: "Ticket" },
  { key: "greeting", label: "Greeting" },
  { key: "link-preview", label: "Link preview" },
  { key: "recipe-card", label: "Recipe card" },
];

interface TemplateGridProps {
  selectedId: string;
  onSelect: (t: TemplateDef) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  selectedId,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const templates = useSignalValue(templatesSignal);
  const isLoading = useSignalValue(templatesLoadingSignal);
  const hasMore = useSignalValue(templatesHasMoreSignal);

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading) loadMoreTemplates();
  }, [isLoading]);

  const sentinelRef = useIntersectionObserver(handleLoadMore, hasMore && !!query);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const stored = localStorage.getItem("imgi-recent-templates");
    const hasRecents = stored ? JSON.parse(stored).length > 0 : false;

    CATEGORIES.forEach((cat, index) => {
      initial[cat.key] = hasRecents || index > 0;
    });
    initial.recent = !hasRecents;
    return initial;
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("imgi-recent-templates");
    return stored ? JSON.parse(stored) : [];
  });

  const user = useSignalValue(userSignal);
  const isLocalhost = window.location.hostname === "localhost";
  const isLocked = !user && !isLocalhost;

  const handleSelect = async (t: TemplateSummary): Promise<void> => {
    const locked = !user && !t.isFree && !isLocalhost;
    trackTemplateClick({ template: t, placement: "studio_panel", locked, signedIn: !!user });
    if (locked) {
      emitModal({ type: "login", reason: "templates" });
      return;
    }

    const nextRecents = [t.id, ...recentIds.filter((id) => id !== t.id)].slice(
      0,
      8,
    );
    setRecentIds(nextRecents);
    localStorage.setItem("imgi-recent-templates", JSON.stringify(nextRecents));

    trackEvent("studio", "template_selected", { details: { template_id: t.id, name: t.name, category: t.category } });
    const full = await fetchFullTemplate(t.id);
    if (full) onSelect(full);
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const searchResults = query.trim()
    ? templates.filter((t) => {
        const q = query.trim().toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
        );
      })
    : null;

  const recentTemplates = recentIds
    .map((id) => templates.find((t) => t.id === id))
    .filter((t): t is TemplateSummary => !!t);

  return (
    <div className="flex flex-col select-none">
      <div className="px-3.5 py-3 sticky top-0 bg-[var(--s-bg-panel)] z-20 border-b border-[var(--s-border)]">
        <div className="flex items-center gap-2.5 bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded-md px-3 py-2 transition-all focus-within:border-[var(--s-text-muted)] focus-within:ring-1 focus-within:ring-[var(--s-border)]">
          <Search size={12} className="text-[var(--s-text-subtle)] shrink-0" />
          <input
            type="text"
            placeholder="Search name, tags, or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] text-[var(--s-text)] placeholder:text-[var(--s-text-muted)] w-full font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <TemplatesNetworkNotice theme="studio" className="mx-3.5 mt-3" />
        {searchResults ? (
          <div className="px-3.5 pt-4 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-[var(--s-border)]" />
              <span className="text-[9px] font-bold text-[var(--s-text-muted)]">
                {searchResults.length} results
              </span>
              <div className="h-px flex-1 bg-[var(--s-border)]" />
            </div>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Search size={24} className="text-[var(--s-border)] mb-3" />
                <p className="text-[11px] text-[var(--s-text-subtle)] font-medium">
                  No templates match your search.
                </p>
              </div>
            ) : (
              <StudioThumbGrid
                templates={searchResults}
                selectedId={selectedId}
                isLocked={isLocked}
                onSelect={(template) => void handleSelect(template)}
              />
            )}
            <div ref={sentinelRef} className="h-8" />
          </div>
        ) : (
          <div className="pb-8">
            {recentTemplates.length > 0 && (
              <div className="border-b border-[var(--s-border)]">
                <button
                  onClick={() => toggleCollapse("recent")}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <History size={11} className="text-[var(--s-accent)]" />
                    <span className="text-[10px] font-bold text-[var(--s-text)]">
                      Recently opened
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px]   text-[var(--s-text-subtle)]">
                      {recentTemplates.length}
                    </span>
                    {collapsed.recent ? (
                      <ChevronRight
                        size={12}
                        className="text-[var(--s-text-muted)]"
                      />
                    ) : (
                      <ChevronDown
                        size={12}
                        className="text-[var(--s-text-muted)]"
                      />
                    )}
                  </div>
                </button>
                {!collapsed.recent && (
                  <StudioThumbGrid
                    templates={recentTemplates}
                    selectedId={selectedId}
                    isLocked={isLocked}
                    onSelect={(template) => void handleSelect(template)}
                    className="px-3.5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200"
                  />
                )}
              </div>
            )}

            {CATEGORIES.map(({ key, label }) => (
              <CategorySection
                key={key}
                categoryKey={key}
                label={label}
                collapsed={collapsed[key] ?? false}
                selectedId={selectedId}
                isLocked={isLocked}
                onToggle={toggleCollapse}
                onSelect={(template) => void handleSelect(template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
