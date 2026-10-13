import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoryLabel } from "../../../data/templates/categories";
import { collectTopTags } from "../../../lib/template-search";
import { TemplatesEmptyState } from "../browse/TemplatesEmptyState";
import { LoginBanner } from "../browse/LoginBanner";
import { TemplateMasonry } from "../grid/TemplateMasonry";
import { isSettledEmpty, type TemplateFeed } from "../grid/use-template-feed";
import { SectionHeading } from "./SectionHeading";
import { ResultsMeta } from "./ResultsMeta";
import type { RenderTemplateCard } from "./card-renderer";
import type { LoginBannerState } from "./login-banner-state";

const TOP_TAG_LIMIT = 14;

interface TemplatesResultsProps {
  feed: TemplateFeed;
  query: string;
  category: string | null;
  loginBanner: LoginBannerState;
  renderCard: RenderTemplateCard;
  onReachEnd: () => void;
  onPickTag: (tag: string) => void;
}

export const TemplatesResults: React.FC<TemplatesResultsProps> = ({
  feed,
  query,
  category,
  loginBanner,
  renderCard,
  onReachEnd,
  onPickTag,
}) => {
  const topTags = useMemo(() => collectTopTags(feed.templates, TOP_TAG_LIMIT), [feed.templates]);
  const title = query ? `Results for "${query}"` : categoryLabel(category ?? "");
  const formatLink = category && !query && (
    <Link
      to={`/templates/${category}`}
      className="flex items-center gap-1 text-[12px] font-semibold text-zinc-500 no-underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
    >
      Open the {categoryLabel(category).toLowerCase()} page
      <ArrowRight size={13} strokeWidth={2.5} />
    </Link>
  );

  return (
    <>
      {loginBanner.visible && <LoginBanner lockedCount={loginBanner.lockedCount} total={loginBanner.total} />}
      <SectionHeading title={title} meta={<ResultsMeta feed={feed} />} action={formatLink} />
      <TemplateMasonry
        feed={feed}
        renderCard={(template) => renderCard(template, "grid")}
        onReachEnd={onReachEnd}
        shuffled={!query}
      />
      {isSettledEmpty(feed) && <TemplatesEmptyState query={query} tags={topTags} onPick={onPickTag} />}
    </>
  );
};
