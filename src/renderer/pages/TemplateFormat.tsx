import React, { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSignalValue } from "../lib/signal";
import { userSignal } from "../hooks/useAuth";
import { backendEnabled } from "../lib/api-client";
import { loadMoreTemplates } from "../store/templates-store";
import { useTemplateActions } from "../hooks/useTemplateActions";
import { collectTopTags } from "../lib/template-search";
import { trackTemplateSearch } from "../modules/tracking/track-template-search";
import { TEMPLATE_CATEGORIES } from "../data/templates/categories";
import { TemplateCard } from "../components/templates/browse/TemplateCard";
import { TemplatesEmptyState } from "../components/templates/browse/TemplatesEmptyState";
import { TemplatesNav } from "../components/templates/browse/TemplatesNav";
import { LoginBanner } from "../components/templates/browse/LoginBanner";
import { FormatHero } from "../components/templates/browse/FormatHero";
import { accentTone } from "../components/templates/browse/accent-tone";
import { TemplateSearchInput } from "../components/templates/header/TemplateSearchInput";
import { TemplateMasonry } from "../components/templates/grid/TemplateMasonry";
import { isFeedPending, isSettledEmpty, useTemplateFeed } from "../components/templates/grid/use-template-feed";
import { useTemplateFilter } from "../components/templates/grid/use-template-filter";

const TOP_TAG_LIMIT = 14;

export const TemplateFormat: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const definition = TEMPLATE_CATEGORIES.find((item) => item.key === category);

  const [searchQuery, setSearchQuery] = useState("");
  const user = useSignalValue(userSignal);
  const feed = useTemplateFeed();
  const { templates, isLoading } = feed;

  const { isLocked, isNew, handleOpen } = useTemplateActions("format_page");

  useTemplateFilter(searchQuery, category ?? "");

  const trimmedQuery = searchQuery.trim();
  const topTags = useMemo(() => collectTopTags(templates, TOP_TAG_LIMIT), [templates]);
  const isSignedOut = !user && backendEnabled;

  if (!definition) return <Navigate to="/templates" replace />;

  const handleReachEnd = (): void => {
    if (!isLoading) void loadMoreTemplates();
  };

  return (
    <main className="relative min-h-screen bg-brand-primary font-editorial transition-colors duration-200 dark:bg-[#09090b]">

      <TemplatesNav
        backTo="/templates"
        backLabel="All formats"
        variant={accentTone(definition.accent).isDark ? "solid" : "overlay"}
      />

      <FormatHero category={definition} templates={templates} total={feed.total} isPending={isFeedPending(feed)} />

      <div className="mx-auto max-w-[1500px] px-6 pb-20 pt-9 md:px-8">
        <div className="mb-9 max-w-[520px]">
          <TemplateSearchInput
            value={searchQuery}
            placeholder={`Search ${definition.label.toLowerCase()}`}
            onChange={setSearchQuery}
            onBlur={() => trackTemplateSearch(searchQuery, templates.length, definition.key)}
          />
        </div>

        {isSignedOut && <LoginBanner lockedCount={feed.lockedTotal} total={feed.total} />}

        <TemplateMasonry
          feed={feed}
          renderCard={(template) => (
            <TemplateCard
              template={template}
              variant="grid"
              locked={isLocked(template)}
              isNew={isNew(template)}
              onOpen={() => handleOpen(template)}
            />
          )}
          onReachEnd={handleReachEnd}
        />

        {isSettledEmpty(feed) && <TemplatesEmptyState query={trimmedQuery} tags={topTags} onPick={setSearchQuery} />}
      </div>
    </main>
  );
};
