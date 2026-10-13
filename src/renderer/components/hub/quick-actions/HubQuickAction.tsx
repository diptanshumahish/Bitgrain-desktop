import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { HubDestination } from "../../../pages/landing-page/HubDestinations";
import { createPreloadHandler, createTransitionClickHandler } from "../../transitions/page-transition-events";
import { QUICK_ACTION_PREVIEWS } from "./quick-action-previews";

interface HubQuickActionProps {
  destination: HubDestination;
}

export const HubQuickAction: React.FC<HubQuickActionProps> = ({ destination }) => {
  const Preview = QUICK_ACTION_PREVIEWS[destination.key];
  const Icon = destination.icon;
  return (
    <Link
      to={destination.to}
      onPointerEnter={createPreloadHandler(destination.to)}
      onFocus={createPreloadHandler(destination.to)}
      onClick={createTransitionClickHandler(destination.to)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] no-underline transition-colors hover:border-[var(--s-border-focus)]"
    >
      <div className="relative h-28 overflow-hidden border-b border-[var(--s-border)] bg-[var(--s-bg-canvas)] md:h-36">
        {Preview && <Preview />}
      </div>
      <div className="flex items-center gap-3 p-4">
        <Icon size={17} strokeWidth={2} className="shrink-0 text-[var(--s-text-muted)] transition-colors group-hover:text-[var(--s-accent)]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-[var(--s-text)]">{destination.title}</span>
          <span className="block truncate text-[12px] text-[var(--s-text-muted)]">{destination.body}</span>
        </span>
        <ArrowUpRight size={16} className="shrink-0 text-[var(--s-text-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--s-text)]" />
      </div>
    </Link>
  );
};
