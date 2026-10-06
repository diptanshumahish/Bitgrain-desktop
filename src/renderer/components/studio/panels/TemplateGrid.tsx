import React, { useState, useCallback, useEffect } from "react";
import { Search, Lock, ChevronDown, ChevronRight, History } from "lucide-react";
import type { TemplateDef } from "../../../data/studioTypes";
import { TemplateThumbnail } from "../../templates/TemplateThumbnail";
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

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "album", label: "Album" },
  { key: "poster", label: "Poster" },
  { key: "wallpaper", label: "Wallpaper" },
  { key: "social", label: "Social" },
  { key: "frame", label: "Frame" },
  { key: "invitation", label: "Invitation" },
  { key: "certificate", label: "Certificate" },
  { key: "id-card", label: "ID Card" },
  { key: "grade-card", label: "Grade Card" },
  { key: "grand-opening", label: "Grand Opening" },
];

interface TemplateThumbProps {
  template: TemplateDef;
  selected: boolean;
  index: number;
  locked: boolean;
  onClick: () => void;
}

const TemplateThumb: React.FC<TemplateThumbProps> = ({
  template,
  selected,
  locked,
  onClick,
}) => (
  <button
    onClick={onClick}
    title={template.name}
    className="group flex flex-col items-stretch gap-1.5 bg-transparent border-none cursor-pointer p-0 w-full text-left break-inside-avoid mb-4"
  >
    <div
      className={`w-full relative overflow-hidden transition-all duration-200 rounded-sm ${
        selected
          ? "ring-2 ring-[var(--s-accent)] ring-offset-2 ring-offset-[var(--s-bg-panel)]"
          : "border border-[var(--s-border)] hover:border-[var(--s-text)] hover:-translate-y-0.5"
      }`}
      style={{
        aspectRatio: `${template.width} / ${template.height}`,
      }}
    >
      <TemplateThumbnail template={template} />

      {selected && (
        <div className="absolute top-2 right-2 bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[9px] px-2 py-0.5 font-semibold rounded-sm">
          ACTIVE
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Lock size={14} className="text-white" />
          <span className="text-[9px] text-white font-bold">Unlock (Free)</span>
        </div>
      )}
    </div>

    <div className="flex items-center justify-between gap-2 mt-1 px-0.5">
      <span
        className={`text-[10px] truncate font-medium flex-1 transition-colors duration-150 ${
          selected
            ? "text-[var(--s-accent)]"
            : "text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)]"
        }`}
      >
        {template.name}
      </span>
      {locked && (
        <Lock size={8} className="text-[var(--s-text-muted)] shrink-0" />
      )}
    </div>
  </button>
);

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

  const sentinelRef = useIntersectionObserver(
    handleLoadMore,
    hasMore && !query,
  );

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const stored = localStorage.getItem("imgi-recent-templates");
    const hasRecents = stored ? JSON.parse(stored).length > 0 : false;

    if (hasRecents) {
      CATEGORIES.forEach((cat) => {
        initial[cat.key] = true;
      });
    } else {
      let foundFirst = false;
      CATEGORIES.forEach((cat) => {
        const hasItems = templatesSignal.value.some(
          (t) => t.category === cat.key,
        );
        if (hasItems && !foundFirst) {
          foundFirst = true;
        } else {
          initial[cat.key] = true;
        }
      });
      initial.recent = true;
    }
    return initial;
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("imgi-recent-templates");
    return stored ? JSON.parse(stored) : [];
  });

  const user = useSignalValue(userSignal);
  const isLocalhost = window.location.hostname === "localhost";
  const isLocked = !user && !isLocalhost;

  const handleSelect = (t: TemplateDef) => {
    if (!user && !t.free && !isLocalhost) {
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
    onSelect(t);
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
    .filter((t): t is TemplateDef => !!t);

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
        {searchResults ? (
          <div className="px-3.5 pt-4 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-[var(--s-border)]" />
              <span className="text-[9px] font-bold text-[var(--s-text-muted)]">
                {searchResults.length} Results
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
              <div className="columns-2 gap-3">
                {searchResults.map((t, i) => (
                  <TemplateThumb
                    key={t.id}
                    template={t}
                    index={i + 1}
                    selected={t.id === selectedId}
                    locked={isLocked && !t.free}
                    onClick={() => handleSelect(t)}
                  />
                ))}
              </div>
            )}
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
                      Recently Opened
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
                  <div className="columns-2 gap-3 px-3.5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {recentTemplates.map((t, i) => (
                      <TemplateThumb
                        key={`recent-${t.id}`}
                        template={t}
                        index={i + 1}
                        selected={t.id === selectedId}
                        locked={isLocked && !t.free}
                        onClick={() => handleSelect(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {CATEGORIES.map(({ key, label }) => {
              const group = templates.filter((t) => t.category === key);
              if (!group.length) return null;
              const isCollapsed = collapsed[key];

              return (
                <div
                  key={key}
                  className="border-b border-[var(--s-border)] last:border-none"
                >
                  <button
                    onClick={() => toggleCollapse(key)}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)] transition-colors">
                      {label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px]   text-[var(--s-text-muted)]">
                        {group.length}
                      </span>
                      {isCollapsed ? (
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
                  {!isCollapsed && (
                    <div className="columns-2 gap-3 px-3.5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      {group.map((t, i) => (
                        <TemplateThumb
                          key={t.id}
                          template={t}
                          index={i + 1}
                          selected={t.id === selectedId}
                          locked={isLocked && !t.free}
                          onClick={() => handleSelect(t)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={sentinelRef} className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
