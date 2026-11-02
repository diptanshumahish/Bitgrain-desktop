import React, { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { categoryNoun, categoryTemplatesLabel } from "./category-noun";
import { ProseHero } from "../../docs/prose/ProseHero";
import { ProseHeroActions } from "../../docs/prose/ProseHeroActions";
import {
  MARINE_GHOST_ON_BLUE_BUTTON_CLASS,
  MARINE_ON_BLUE_BUTTON_CLASS,
} from "../../landing/marketing/marine/marine-classes";
import { LandingFooter } from "../../landing/LandingFooter";
import { loadTemplateDetail, templateDetailSignal } from "./template-detail-store";
import { templateStartPath } from "./template-detail-paths";
import { trackTemplateStart } from "./track-template-start";
import { TemplateDetailHead } from "./TemplateDetailHead";
import { TemplateDetailBody } from "./TemplateDetailBody";

export const TemplateDetailPage: React.FC = () => {
  const { category = "", templateId = "" } = useParams<{ category: string; templateId: string }>();
  const state = useSignalValue(templateDetailSignal);

  useEffect(() => {
    void loadTemplateDetail(templateId);
  }, [templateId]);

  const isCurrent = state.templateId === templateId;
  if (isCurrent && state.status === "missing") return <Navigate to={`/templates/${category}`} replace />;

  const detail = isCurrent ? state.detail : null;
  const categoryKey = detail?.category ?? category;

  return (
    <div className="min-h-screen bg-paper text-ink-soft font-display antialiased">
      {detail && <TemplateDetailHead detail={detail} />}
      <ProseHero eyebrow={categoryTemplatesLabel(categoryKey)} headline={detail?.name ?? "Loading template"} lead={detail?.description}>
        {detail && (
          <ProseHeroActions>
            <Link
              to={templateStartPath(detail.id)}
              onClick={() => trackTemplateStart(detail)}
              className={MARINE_ON_BLUE_BUTTON_CLASS}
            >
              Use this template <ArrowRight size={16} strokeWidth={2.25} />
            </Link>
            <Link to={`/templates/${detail.category}`} className={MARINE_GHOST_ON_BLUE_BUTTON_CLASS}>
              More {categoryNoun(categoryKey)} templates
            </Link>
          </ProseHeroActions>
        )}
      </ProseHero>
      {detail && <TemplateDetailBody detail={detail} />}
      <LandingFooter />
    </div>
  );
};
