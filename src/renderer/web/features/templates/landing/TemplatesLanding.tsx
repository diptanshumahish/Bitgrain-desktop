import React from "react";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { TEMPLATE_CATEGORIES } from "../data/categories";
import { FormatCards } from "../browse/FormatCards";
import { LoginBanner } from "../browse/LoginBanner";
import { TemplateRowShimmer } from "../loading/TemplateRowShimmer";
import { TemplateMasonry } from "../grid/TemplateMasonry";
import { isFeedPending, type TemplateFeed } from "../grid/use-template-feed";
import { SectionHeading } from "./SectionHeading";
import { MarineTemplateRow } from "./marine/MarineTemplateRow";
import type { RenderTemplateCard } from "./card-renderer";
import type { LoginBannerState } from "./login-banner-state";

const PICKS_TITLE = "Editor's picks";

interface TemplatesLandingProps {
  feed: TemplateFeed;
  previews: Map<string, TemplateSummary>;
  recents: TemplateSummary[];
  featured: TemplateSummary[];
  showFeatured: boolean;
  loginBanner: LoginBannerState;
  renderCard: RenderTemplateCard;
  onReachEnd: () => void;
}

export const TemplatesLanding: React.FC<TemplatesLandingProps> = ({
  feed,
  previews,
  recents,
  featured,
  showFeatured,
  loginBanner,
  renderCard,
  onReachEnd,
}) => {
  const isPending = isFeedPending(feed);
  const isFirstLoad = isPending && feed.templates.length === 0;

  return (
    <>
      <MarineTemplateRow title="Browse by format">
        <FormatCards categories={TEMPLATE_CATEGORIES} previews={previews} isPending={isPending} />
      </MarineTemplateRow>

      {loginBanner.visible && <LoginBanner />}

      {recents.length > 0 && (
        <MarineTemplateRow title="Recently opened">
          {recents.map((template) => renderCard(template, "row"))}
        </MarineTemplateRow>
      )}

      {isFirstLoad && <TemplateRowShimmer title={PICKS_TITLE} />}
      {showFeatured && (
        <MarineTemplateRow title={PICKS_TITLE}>
          {featured.map((template) => renderCard(template, "row"))}
        </MarineTemplateRow>
      )}

      <section>
        <SectionHeading title="All templates" />
        <TemplateMasonry
          feed={feed}
          renderCard={(template) => renderCard(template, "grid")}
          onReachEnd={onReachEnd}
          shuffled
        />
      </section>
    </>
  );
};
