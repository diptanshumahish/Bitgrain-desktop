import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { HubDestination } from "../../landing/HubDestinations";
import { createPreloadHandler } from "../../../app/shell/transitions/route-preloaders";
import { QUICK_ACTION_PREVIEWS } from "./quick-action-previews";
import {
  APP_ARROW_BADGE_CLASS,
  APP_CARD_BODY_CLASS,
  APP_CARD_CLASS,
  APP_CARD_TITLE_CLASS,
} from "@bitgrain/ui/theme/app-marine-classes";
import { BetaBadge } from "../../../app/shell/app-marine/BetaBadge";

interface HubQuickActionProps {
  destination: HubDestination;
}

export const HubQuickAction: React.FC<HubQuickActionProps> = ({ destination }) => {
  const Preview = QUICK_ACTION_PREVIEWS[destination.key];
  return (
    <Link
      to={destination.to}
      onPointerEnter={createPreloadHandler(destination.to)}
      onFocus={createPreloadHandler(destination.to)}
      className={`group flex items-center overflow-hidden p-2 no-underline sm:flex-col sm:items-stretch ${APP_CARD_CLASS}`}
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[14px] bg-paper sm:h-32 sm:w-auto md:h-40 dark:bg-white/5">
        {Preview && <Preview />}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:pb-2 sm:pt-4">
        <span className="min-w-0 flex-1">
          <span className={`flex items-center gap-2 ${APP_CARD_TITLE_CLASS}`}>
            {destination.title}
            {destination.beta && <BetaBadge />}
          </span>
          <span className={`mt-0.5 block line-clamp-2 sm:truncate ${APP_CARD_BODY_CLASS}`}>{destination.body}</span>
        </span>
        <span className={`max-sm:hidden ${APP_ARROW_BADGE_CLASS}`}>
          <ArrowUpRight size={16} strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
};
