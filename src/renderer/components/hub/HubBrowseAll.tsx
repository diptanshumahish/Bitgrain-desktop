import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPreloadHandler, createTransitionClickHandler } from "../transitions/page-transition-events";

const TEMPLATES_PATH = "/templates";

interface HubBrowseAllProps {
  total: number;
}

export const HubBrowseAll: React.FC<HubBrowseAllProps> = ({ total }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-56 items-end justify-center bg-gradient-to-t from-[var(--s-bg-canvas)] via-[var(--s-bg-canvas)]/85 to-transparent pb-6">
    <Link
      to={TEMPLATES_PATH}
      onPointerEnter={createPreloadHandler(TEMPLATES_PATH)}
      onFocus={createPreloadHandler(TEMPLATES_PATH)}
      onClick={createTransitionClickHandler(TEMPLATES_PATH)}
      className="group pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--s-text)] px-6 py-3 text-[14px] font-semibold text-[var(--s-bg-canvas)] no-underline shadow-lg transition-opacity hover:opacity-90"
    >
      {total > 0 ? `Browse all ${total} templates` : "Browse all templates"}
      <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  </div>
);
