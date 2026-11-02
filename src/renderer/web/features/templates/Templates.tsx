import React, { useState, useEffect, useMemo, useRef } from "react";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { backendEnabled } from "@bitgrain/api/api-client";
import { loadMoreTemplates, loadTemplates } from "@bitgrain/platform/templates/store/templates-store";
import { findLoadedTemplate } from "@bitgrain/platform/templates/store/templates-registry";
import { useTemplateActions } from "./use-template-actions";
import { trackEvent } from "@bitgrain/platform/tracker";
import { trackTemplateSearch } from "@bitgrain/platform/analytics/tracking/track-template-search";
import { ALL_CATEGORY } from "./data/categories";
import { firstPerCategory, getFeatured } from "./browse/group-templates";
import { TemplateCard } from "./browse/TemplateCard";
import { TemplatesWallHero } from "./landing/marine/TemplatesWallHero";
import { MarineTemplatesToolbar } from "./landing/marine/MarineTemplatesToolbar";
import { LIBRARY_PANEL_CLASS } from "./landing/marine/marine-library-classes";
import { TemplatesLanding } from "./landing/TemplatesLanding";
import { TemplatesResults } from "./landing/TemplatesResults";
import type { CardVariant } from "./landing/card-renderer";
import { useTemplateFeed } from "./grid/use-template-feed";
import { useTemplateFilter } from "./grid/use-template-filter";
import { useInAppChrome } from "../../app/shell/app-marine/use-in-app-chrome";
import { APP_BAND_CLASS, APP_MARINE_SCOPE_CLASS } from "@bitgrain/ui/theme/app-marine-classes";
import { TemplatesAppHeader } from "./landing/app/TemplatesAppHeader";
import { APP_TOOLBAR_STICKY_CLASS, NAV_HEIGHT } from "./landing/app/templates-app-classes";
import { PageSeo } from "../seo/PageSeo";
import { TEMPLATES_SEO } from "../seo/route-meta/product-surface-seo";

const FEATURED_LIMIT = 10;
const MIN_FEATURED = 3;
const RECENTS_SHOWN = 8;
const STICKY_CHROME_HEIGHT = 88;
const MARKETING_MAIN_CLASS = "bg-paper text-ink-soft font-display antialiased";

export const Templates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const user = useSignalValue(userSignal);
  const inApp = useInAppChrome();
  const contentRef = useRef<HTMLDivElement>(null);
  const feed = useTemplateFeed();
  const { templates, isLoading } = feed;

  const trimmedQuery = searchQuery.trim();
  const isLanding = !trimmedQuery && activeCategory === ALL_CATEGORY;
  const { recents, isNew, handleOpen } = useTemplateActions(
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

  const loginBanner = { visible: !user && backendEnabled };
  const handleReachEnd = (): void => {
    if (!isLoading) void loadMoreTemplates();
  };

  const scrollToContent = (): void => {
    // Desktop (PORTED.md): the page scrolls inside the home tab's container, not the window.
    const scroller = contentRef.current?.closest<HTMLElement>("[data-home-scroll]");
    if (!scroller) return;
    const scrollerTop = scroller.getBoundingClientRect().top;
    const contentTop = (contentRef.current?.getBoundingClientRect().top ?? 0) - scrollerTop + scroller.scrollTop;
    const target = contentTop - STICKY_CHROME_HEIGHT - (inApp ? NAV_HEIGHT : 0);
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
      isNew={isNew(template)}
      onOpen={() => handleOpen(template)}
    />
  );

  return (
    <main className={`min-h-screen ${inApp ? APP_MARINE_SCOPE_CLASS : MARKETING_MAIN_CLASS}`}>
      <PageSeo meta={TEMPLATES_SEO} />

      {inApp ? <TemplatesAppHeader /> : <TemplatesWallHero />}
      <MarineTemplatesToolbar
        query={searchQuery}
        activeCategory={activeCategory}
        onQueryChange={setSearchQuery}
        onSearchBlur={() => trackTemplateSearch(searchQuery, templates.length, activeCategory)}
        onSelectCategory={selectCategory}
        stickyClass={inApp ? APP_TOOLBAR_STICKY_CLASS : undefined}
      />

      <div ref={contentRef} className={`${inApp ? APP_BAND_CLASS : "bg-apricot"} pb-2.5 pt-2`}>
        <div className={LIBRARY_PANEL_CLASS}>
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
      </div>

    </main>
  );
};
