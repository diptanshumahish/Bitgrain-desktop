import React from "react";
import { AppKicker } from "./AppKicker";
import { APP_DISPLAY_CLASS, APP_LEAD_CLASS, APP_SERIF_ACCENT_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

interface AppPageHeadingProps {
  kicker: string;
  title: string;
  accent: string;
  lead?: string;
}

export const AppPageHeading: React.FC<AppPageHeadingProps> = ({ kicker, title, accent, lead }) => (
  <div>
    <AppKicker label={kicker} />
    <h1 className={`mt-5 text-[clamp(2.25rem,4.6vw,3.6rem)] ${APP_DISPLAY_CLASS}`}>
      {title} <span className={APP_SERIF_ACCENT_CLASS}>{accent}</span>
    </h1>
    {lead && <p className={`mt-4 max-w-xl ${APP_LEAD_CLASS}`}>{lead}</p>}
  </div>
);
