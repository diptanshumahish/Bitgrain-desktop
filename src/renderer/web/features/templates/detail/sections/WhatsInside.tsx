import React from "react";
import type { TemplateDetail } from "../template-detail-types";
import { insideFacts } from "../insights/inside-facts";
import { PaletteSwatches } from "./PaletteSwatches";
import { SECTION_HEADING_CLASS } from "./section-classes";

export const WhatsInside: React.FC<{ detail: TemplateDetail }> = ({ detail }) => {
  const palette = detail.insights?.palette ?? [];
  return (
    <>
      <h2 className={SECTION_HEADING_CLASS}>What's inside</h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[16px] leading-[1.6] m-0">
        {insideFacts(detail).map((fact) => (
          <React.Fragment key={fact.label}>
            <dt className="text-ink-soft">{fact.label}</dt>
            <dd className="m-0 text-ink-soft/80">{fact.value}</dd>
          </React.Fragment>
        ))}
      </dl>
      {palette.length > 0 && <PaletteSwatches palette={palette} />}
    </>
  );
};
