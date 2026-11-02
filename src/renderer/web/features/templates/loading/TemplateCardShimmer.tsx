import React from "react";
import { shimmerShapeAt } from "./shimmer-shapes";

interface TemplateCardShimmerProps {
  slot: number;
}

export const TemplateCardShimmer: React.FC<TemplateCardShimmerProps> = ({ slot }) => (
  <div className="mb-4" aria-hidden="true">
    <div className={`skeleton-shimmer rounded-xl ${shimmerShapeAt(slot).aspectClass}`} />
    <div className="pt-2.5">
      <div className="skeleton-shimmer h-3 w-3/5 rounded" />
      <div className="skeleton-shimmer mt-1.5 h-2.5 w-1/4 rounded" />
    </div>
  </div>
);
