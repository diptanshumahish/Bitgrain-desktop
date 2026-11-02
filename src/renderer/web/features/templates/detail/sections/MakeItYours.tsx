import React from "react";
import type { TemplateDetail } from "../template-detail-types";
import { makeItYoursSteps } from "../insights/make-it-yours";
import { SECTION_HEADING_CLASS, SECTION_LIST_CLASS, SECTION_TEXT_CLASS } from "./section-classes";

const GENERIC_STEPS =
  "The template opens in the studio as a real layered document. Change the words, swap the photos, adjust the colours and effects, then export a PNG or a PDF.";

export const MakeItYours: React.FC<{ detail: TemplateDetail }> = ({ detail }) => {
  const steps = makeItYoursSteps(detail);
  return (
    <>
      <h2 className={`${SECTION_HEADING_CLASS} mt-10`}>How to make it yours</h2>
      {steps.length > 0 ? (
        <ol className={`${SECTION_LIST_CLASS} list-decimal`}>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className={SECTION_TEXT_CLASS}>{GENERIC_STEPS}</p>
      )}
    </>
  );
};
