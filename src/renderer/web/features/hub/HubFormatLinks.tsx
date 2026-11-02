import React from "react";
import { Link } from "react-router-dom";
import { categoryLabel } from "../templates/data/categories";
import { trackEvent } from "@bitgrain/platform/tracker";
import { APP_CHIP_ACTIVE_CLASS, APP_CHIP_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

const HUB_FORMAT_KEYS = ["poster", "social", "album", "pitch-deck", "resume", "invitation", "flyer"];

const trackFormatClick = (category: string): void => {
  trackEvent("nav", "hub_format_clicked", { details: { category } });
};

export const HubFormatLinks: React.FC = () => (
  <div className="no-scrollbar -mx-6 mb-6 flex gap-1.5 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
    {HUB_FORMAT_KEYS.map((key) => (
      <Link key={key} to={`/templates/${key}`} onClick={() => trackFormatClick(key)} className={APP_CHIP_CLASS}>
        {categoryLabel(key)}
      </Link>
    ))}
    <Link to="/templates" className={APP_CHIP_ACTIVE_CLASS}>
      All formats
    </Link>
  </div>
);
