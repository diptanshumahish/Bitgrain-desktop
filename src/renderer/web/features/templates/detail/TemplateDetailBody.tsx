import React from "react";
import { Link } from "react-router-dom";
import { TemplateCardImage } from "@bitgrain/studio/templates/card/TemplateCardImage";
import { MARINE_SECTION_INNER_CLASS } from "../../landing/marketing/marine/marine-classes";
import { relatedFormats } from "../data/related-formats";
import type { TemplateDetail } from "./template-detail-types";
import { WhatsInside } from "./sections/WhatsInside";
import { GoodFor } from "./sections/GoodFor";
import { MakeItYours } from "./sections/MakeItYours";
import { SimilarTemplates } from "./sections/SimilarTemplates";
import { SECTION_CHIP_CLASS, SECTION_HEADING_CLASS } from "./sections/section-classes";

export const TemplateDetailBody: React.FC<{ detail: TemplateDetail }> = ({ detail }) => (
  <>
    <section className="py-16 sm:py-24">
      <div className={`${MARINE_SECTION_INNER_CLASS} grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start`}>
        <div className="overflow-hidden rounded-[20px] border border-stone bg-white">
          <TemplateCardImage template={detail} eager />
        </div>
        <div>
          <WhatsInside detail={detail} />
          <GoodFor useCases={detail.useCases} />
          <MakeItYours detail={detail} />
          <h2 className={`${SECTION_HEADING_CLASS} mt-10`}>Related formats</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5 list-none p-0 m-0">
            {relatedFormats(detail.category).map((format) => (
              <li key={format.key}>
                <Link to={`/templates/${format.key}`} className={SECTION_CHIP_CLASS}>{format.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
    <SimilarTemplates detail={detail} />
  </>
);
