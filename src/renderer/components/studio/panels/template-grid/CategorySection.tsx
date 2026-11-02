import React, { useEffect } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import type { TemplateSummary } from "../../../../lib/template-cards/template-summary";
import { categoryTemplatesSignal, loadCategoryPage, readCategory } from "./category-templates-store";
import { StudioThumbGrid } from "./StudioThumbGrid";

const SKELETON_TILES = ["tall", "short", "short", "tall"];

interface CategorySectionProps {
  categoryKey: string;
  label: string;
  collapsed: boolean;
  selectedId: string;
  isLocked: boolean;
  onToggle: (key: string) => void;
  onSelect: (template: TemplateSummary) => void;
}

const CategorySkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-2 px-3.5 pb-4" aria-label="Loading templates">
    {SKELETON_TILES.map((size, index) => (
      <div
        key={`${size}-${index}`}
        className={`rounded-md bg-[var(--s-bg-input)] animate-pulse ${size === "tall" ? "h-32" : "h-20"}`}
      />
    ))}
  </div>
);

const CategoryError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div role="status" className="mx-3.5 mb-4 flex flex-col items-start gap-2 rounded-lg border border-[var(--s-border)] p-3">
    <p className="text-[11px] font-semibold text-[var(--s-text)]">Templates are taking longer than usual on our side</p>
    <p className="text-[11px] leading-relaxed text-[var(--s-text-muted)]">This one is on us, not your connection.</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-md border border-[var(--s-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
    >
      Try again
    </button>
  </div>
);

const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <button
    type="button"
    disabled={loading}
    onClick={onClick}
    className="mx-3.5 mb-4 flex w-[calc(100%-1.75rem)] items-center justify-center gap-1.5 rounded-md border border-[var(--s-border)] py-1.5 text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] disabled:opacity-60"
  >
    {loading && <Loader2 size={11} className="animate-spin" />}
    {loading ? "Loading more" : "Show more"}
  </button>
);

export const CategorySection: React.FC<CategorySectionProps> = ({
  categoryKey, label, collapsed, selectedId, isLocked, onToggle, onSelect,
}) => {
  useSignalValue(categoryTemplatesSignal);
  const state = readCategory(categoryKey);
  const load = (): void => void loadCategoryPage(categoryKey);

  useEffect(() => {
    if (!collapsed && readCategory(categoryKey).status === "idle") void loadCategoryPage(categoryKey);
  }, [collapsed, categoryKey]);

  const count = state.status === "ready" ? state.total : null;
  const loadingFirst = state.status === "loading" && state.items.length === 0;

  return (
    <div className="border-b border-[var(--s-border)] last:border-none">
      <button
        type="button"
        onClick={() => onToggle(categoryKey)}
        aria-expanded={!collapsed}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[var(--s-bg-input)] transition-colors group"
      >
        <span className="text-[11px] font-semibold text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)]">{label}</span>
        <span className="flex items-center gap-3">
          {count !== null && <span className="text-[10px] text-[var(--s-text-muted)]">{count}</span>}
          {collapsed ? <ChevronRight size={12} className="text-[var(--s-text-muted)]" /> : <ChevronDown size={12} className="text-[var(--s-text-muted)]" />}
        </span>
      </button>
      {!collapsed && loadingFirst && <CategorySkeleton />}
      {!collapsed && state.status === "failed" && <CategoryError onRetry={load} />}
      {!collapsed && state.items.length > 0 && (
        <StudioThumbGrid
          templates={state.items}
          selectedId={selectedId}
          isLocked={isLocked}
          onSelect={onSelect}
          className="px-3.5 pb-4"
        />
      )}
      {!collapsed && state.status === "ready" && state.items.length === 0 && (
        <p className="px-4 pb-4 text-[11px] text-[var(--s-text-muted)]">No templates here yet.</p>
      )}
      {!collapsed && state.items.length > 0 && state.hasMore && state.status !== "failed" && (
        <LoadMoreButton loading={state.status === "loading"} onClick={load} />
      )}
    </div>
  );
};
