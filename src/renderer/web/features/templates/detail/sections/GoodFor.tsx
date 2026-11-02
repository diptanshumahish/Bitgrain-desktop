import React from "react";
import { SECTION_HEADING_CLASS, SECTION_LIST_CLASS } from "./section-classes";

export const GoodFor: React.FC<{ useCases: string[] }> = ({ useCases }) =>
  useCases.length === 0 ? null : (
    <>
      <h2 className={`${SECTION_HEADING_CLASS} mt-10`}>Good for</h2>
      <ul className={SECTION_LIST_CLASS}>
        {useCases.map((useCase) => (
          <li key={useCase}>{useCase}</li>
        ))}
      </ul>
    </>
  );
