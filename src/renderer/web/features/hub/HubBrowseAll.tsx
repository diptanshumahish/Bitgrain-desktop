import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPreloadHandler } from "../../app/shell/transitions/route-preloaders";
import { APP_PRIMARY_BUTTON_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

const TEMPLATES_PATH = "/templates";

export const HubBrowseAll: React.FC = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-center justify-center border-t border-[var(--s-border)] bg-[var(--s-bg-canvas)]">
    <Link
      to={TEMPLATES_PATH}
      onPointerEnter={createPreloadHandler(TEMPLATES_PATH)}
      onFocus={createPreloadHandler(TEMPLATES_PATH)}
      className={`group pointer-events-auto ${APP_PRIMARY_BUTTON_CLASS}`}
    >
      Browse all templates
      <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  </div>
);
