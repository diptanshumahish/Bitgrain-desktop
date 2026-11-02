import React from "react";
import { LIBRARY_HEADING_CLASS } from "../landing/marine/marine-library-classes";

const ROW_SHIMMER_WIDTHS = ["w-[186px]", "w-[232px]", "w-[164px]", "w-[210px]"];
const ROW_SHIMMER_COUNT = 7;

const RowCardShimmer: React.FC<{ widthClass: string }> = ({ widthClass }) => (
  <div className={`shrink-0 ${widthClass}`}>
    <div className="skeleton-shimmer h-[232px] rounded-xl" />
    <div className="skeleton-shimmer mt-2.5 h-3 w-3/5 rounded" />
    <div className="skeleton-shimmer mt-1.5 h-2.5 w-1/4 rounded" />
  </div>
);

export const TemplateRowShimmer: React.FC<{ title: string }> = ({ title }) => (
  <section className="mb-14" aria-busy="true">
    <h2 className={`mb-5 ${LIBRARY_HEADING_CLASS}`}>{title}</h2>
    <div className="flex gap-3 overflow-hidden pb-2" aria-hidden="true">
      {Array.from({ length: ROW_SHIMMER_COUNT }, (_, index) => (
        <RowCardShimmer
          key={`row-shimmer-${index}`}
          widthClass={ROW_SHIMMER_WIDTHS[index % ROW_SHIMMER_WIDTHS.length]}
        />
      ))}
    </div>
  </section>
);
