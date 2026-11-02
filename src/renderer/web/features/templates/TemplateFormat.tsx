import React, { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { backendEnabled } from "@bitgrain/api/api-client";
import { loadMoreTemplates } from "@bitgrain/platform/templates/store/templates-store";
import { useTemplateActions } from "./use-template-actions";
import { collectTopTags } from "@bitgrain/platform/templates/template-search";
import { trackTemplateSearch } from "@bitgrain/platform/analytics/tracking/track-template-search";
import { TEMPLATE_CATEGORIES } from "./data/categories";
import { TemplateCard } from "./browse/TemplateCard";
import { TemplatesEmptyState } from "./browse/TemplatesEmptyState";
import { LoginBanner } from "./browse/LoginBanner";
import { FormatWallHero } from "./landing/marine/FormatWallHero";
import { MarineSearchInput } from "./landing/marine/MarineSearchInput";
import { LIBRARY_PANEL_CLASS } from "./landing/marine/marine-library-classes";
import { TemplateMasonry } from "./grid/TemplateMasonry";
import { isSettledEmpty, useTemplateFeed } from "./grid/use-template-feed";
import { useTemplateFilter } from "./grid/use-template-filter";
import { useInAppChrome } from "../../app/shell/app-marine/use-in-app-chrome";
import { APP_BAND_CLASS, APP_MARINE_SCOPE_CLASS } from "@bitgrain/ui/theme/app-marine-classes";
import { FormatAppHeader } from "./landing/app/FormatAppHeader";
import { PageSeo } from "../seo/PageSeo";
import { templateCategorySeo } from "../seo/route-meta/template-seo";

const TOP_TAG_LIMIT = 14;
const MARKETING_MAIN_CLASS = "bg-paper text-ink-soft font-display antialiased";

export const TemplateFormat: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const definition = TEMPLATE_CATEGORIES.find((item) => item.key === category);

  const [searchQuery, setSearchQuery] = useState("");
  const user = useSignalValue(userSignal);
  const inApp = useInAppChrome();
  const feed = useTemplateFeed();
  const { templates, isLoading } = feed;

  const { isNew, handleOpen } = useTemplateActions("format_page");

  useTemplateFilter(searchQuery, category ?? "");

  const trimmedQuery = searchQuery.trim();
  const topTags = useMemo(() => collectTopTags(templates, TOP_TAG_LIMIT), [templates]);
  const isSignedOut = !user && backendEnabled;

  if (!definition) return <Navigate to="/templates" replace />;

  const handleReachEnd = (): void => {
    if (!isLoading) void loadMoreTemplates();
  };

  return (
    <main className={`relative min-h-screen ${inApp ? APP_MARINE_SCOPE_CLASS : MARKETING_MAIN_CLASS}`}>
      <PageSeo meta={templateCategorySeo(definition)} />

      {inApp ? (
        <FormatAppHeader category={definition} />
      ) : (
        <FormatWallHero category={definition} templates={templates} />
      )}

      <div className={`${inApp ? APP_BAND_CLASS : "bg-apricot"} pb-2.5 pt-8`}>
        <div className="mb-8 px-6.5 sm:px-10.5 lg:px-14.5">
          <div className="max-w-[520px]">
            <MarineSearchInput
              value={searchQuery}
              placeholder={`Search ${definition.label.toLowerCase()}`}
              onChange={setSearchQuery}
              onBlur={() => trackTemplateSearch(searchQuery, templates.length, definition.key)}
            />
          </div>
        </div>

        <div className={LIBRARY_PANEL_CLASS}>
          {isSignedOut && <LoginBanner />}

          <TemplateMasonry
            feed={feed}
            renderCard={(template) => (
              <TemplateCard
                template={template}
                variant="grid"
                isNew={isNew(template)}
                onOpen={() => handleOpen(template)}
              />
            )}
            onReachEnd={handleReachEnd}
          />

          {isSettledEmpty(feed) && <TemplatesEmptyState query={trimmedQuery} tags={topTags} onPick={setSearchQuery} />}
        </div>
      </div>
    </main>
  );
};
