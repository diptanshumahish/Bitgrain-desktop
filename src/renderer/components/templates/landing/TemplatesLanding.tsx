import React from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { TEMPLATE_CATEGORIES } from "../../../data/templates/categories";
import { FormatCards } from "../browse/FormatCards";
import { TemplateRow } from "../browse/TemplateRow";
import { LoginBanner } from "../browse/LoginBanner";
import { TemplateRowShimmer } from "../loading/TemplateRowShimmer";
import { TemplateMasonry } from "../grid/TemplateMasonry";
import { isFeedPending, type TemplateFeed } from "../grid/use-template-feed";
import { SectionHeading } from "./SectionHeading";
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
      <TemplateRow title="Browse by format">
        <FormatCards categories={TEMPLATE_CATEGORIES} previews={previews} isPending={isPending} />
      </TemplateRow>

      {loginBanner.visible && <LoginBanner lockedCount={loginBanner.lockedCount} total={loginBanner.total} />}

      {recents.length > 0 && (
        <TemplateRow title="Recently opened">{recents.map((template) => renderCard(template, "row"))}</TemplateRow>
      )}

      {isFirstLoad && <TemplateRowShimmer title={PICKS_TITLE} />}
      {showFeatured && (
        <TemplateRow title={PICKS_TITLE}>{featured.map((template) => renderCard(template, "row"))}</TemplateRow>
      )}

      <section>
        <SectionHeading title="All templates" meta={feed.total > 0 ? `${feed.total} to pick from` : undefined} />
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
