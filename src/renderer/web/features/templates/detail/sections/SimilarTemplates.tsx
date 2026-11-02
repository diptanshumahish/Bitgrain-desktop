import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { TemplateCardImage } from "@bitgrain/studio/templates/card/TemplateCardImage";
import { MARINE_SECTION_INNER_CLASS } from "../../../landing/marketing/marine/marine-classes";
import type { TemplateDetail } from "../template-detail-types";
import { templateDetailPath } from "../template-detail-paths";
import { loadSimilarTemplates, similarTemplatesSignal } from "./similar-templates-store";
import { SECTION_HEADING_CLASS } from "./section-classes";

export const SimilarTemplates: React.FC<{ detail: TemplateDetail }> = ({ detail }) => {
  const state = useSignalValue(similarTemplatesSignal);

  useEffect(() => {
    void loadSimilarTemplates(detail);
  }, [detail]);

  const similar = state.templateId === detail.id ? state.similar : [];
  if (similar.length === 0) return null;

  return (
    <section className="pb-16 sm:pb-24">
      <div className={MARINE_SECTION_INNER_CLASS}>
        <h2 className={SECTION_HEADING_CLASS}>Similar templates</h2>
        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-5 list-none p-0 m-0">
          {similar.map(({ template }) => (
            <li key={template.id}>
              <Link to={templateDetailPath(template.category, template.id)} className="block no-underline text-ultramarine">
                <div className="overflow-hidden rounded-[14px] border border-stone bg-white">
                  <TemplateCardImage template={template} />
                </div>
                <span className="mt-2 block text-[15px]">{template.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
