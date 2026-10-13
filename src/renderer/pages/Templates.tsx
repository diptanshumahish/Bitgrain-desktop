import React, { useState, useEffect, useMemo, useRef } from "react";
import type { TemplateSummary } from "../lib/template-cards/template-summary";
import { useSignalValue } from "../lib/signal";
import { userSignal } from "../hooks/useAuth";
import { backendEnabled } from "../lib/api-client";
import { loadMoreTemplates, loadTemplates } from "../store/templates-store";
import { findLoadedTemplate } from "../store/templates/templates-registry";
import { useTemplateActions } from "../hooks/useTemplateActions";
import { trackEvent } from "../lib/tracker";
import { trackTemplateSearch } from "../modules/tracking/track-template-search";
import { ALL_CATEGORY } from "../data/templates/categories";
import { firstPerCategory, getFeatured } from "../components/templates/browse/group-templates";
import { TemplateCard } from "../components/templates/browse/TemplateCard";
import { TemplatesNav } from "../components/templates/browse/TemplatesNav";
import { TemplatesHero } from "../components/templates/header/TemplatesHero";
import { TemplatesToolbar } from "../components/templates/header/TemplatesToolbar";
import { TemplatesLanding } from "../components/templates/landing/TemplatesLanding";
import { TemplatesResults } from "../components/templates/landing/TemplatesResults";
import type { CardVariant } from "../components/templates/landing/card-renderer";
import { isFeedPending, useTemplateFeed } from "../components/templates/grid/use-template-feed";
import { useTemplateFilter } from "../components/templates/grid/use-template-filter";

const FEATURED_LIMIT = 10;
const MIN_FEATURED = 3;
const RECENTS_SHOWN = 8;
const STICKY_CHROME_HEIGHT = 136;

export const Templates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const user = useSignalValue(userSignal);
  const contentRef = useRef<HTMLDivElement>(null);
  const feed = useTemplateFeed();
  const { templates, isLoading } = feed;

  const trimmedQuery = searchQuery.trim();
  const isLanding = !trimmedQuery && activeCategory === ALL_CATEGORY;
  const { recents, isLocked, isNew, handleOpen } = useTemplateActions(
    isLanding ? "templates_landing" : "templates_filtered",
  );

  useEffect(() => {
    void loadTemplates();
  }, []);
  useTemplateFilter(searchQuery, activeCategory);

  const previews = useMemo(() => firstPerCategory(templates), [templates]);
  const featured = useMemo(() => getFeatured(templates, FEATURED_LIMIT), [templates]);

  const recentTemplates = recents
    .map((id) => findLoadedTemplate(id))
    .filter((template): template is TemplateSummary => !!template)
    .slice(0, RECENTS_SHOWN);

  const loginBanner = { visible: !user && backendEnabled, lockedCount: feed.lockedTotal, total: feed.total };
  const handleReachEnd = (): void => {
    if (!isLoading) void loadMoreTemplates();
  };

  // Desktop: the page scrolls inside the home surface, not the window.
  const scrollToContent = (): void => {
    const scroller = contentRef.current?.closest<HTMLElement>("[data-home-scroll]");
    if (!scroller || !contentRef.current) return;
    const contentTop =
      contentRef.current.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    const target = contentTop - STICKY_CHROME_HEIGHT;
    if (scroller.scrollTop > target) scroller.scrollTo({ top: target, behavior: "smooth" });
  };

  const selectCategory = (key: string): void => {
    setSearchQuery("");
    setActiveCategory(key);
    scrollToContent();
    if (key !== ALL_CATEGORY) {
      trackEvent("templates", "category_selected", { details: { category: key } });
    }
  };

  const renderCard = (template: TemplateSummary, variant: CardVariant): React.ReactNode => (
    <TemplateCard
      key={`${variant}-${template.id}`}
      template={template}
      variant={variant}
      locked={isLocked(template)}
      isNew={isNew(template)}
      onOpen={() => handleOpen(template)}
    />
  );

  return (
    <main className="min-h-screen bg-brand-primary font-editorial transition-colors duration-200 dark:bg-[#09090b]">

      <TemplatesNav backTo="/" backLabel="Back" />
      <TemplatesHero isPending={isFeedPending(feed)} />
      <TemplatesToolbar
        query={searchQuery}
        activeCategory={activeCategory}
        onQueryChange={setSearchQuery}
        onSearchBlur={() => trackTemplateSearch(searchQuery, templates.length, activeCategory)}
        onSelectCategory={selectCategory}
      />

      <div ref={contentRef} className="px-6 pb-20 pt-10 md:px-8">
        {isLanding ? (
          <TemplatesLanding
            feed={feed}
            previews={previews}
            recents={recentTemplates}
            featured={featured}
            showFeatured={featured.length >= MIN_FEATURED}
            loginBanner={loginBanner}
            renderCard={renderCard}
            onReachEnd={handleReachEnd}
          />
        ) : (
          <TemplatesResults
            feed={feed}
            query={trimmedQuery}
            category={activeCategory === ALL_CATEGORY ? null : activeCategory}
            loginBanner={loginBanner}
            renderCard={renderCard}
            onReachEnd={handleReachEnd}
            onPickTag={setSearchQuery}
          />
        )}
      </div>
    </main>
  );
};
