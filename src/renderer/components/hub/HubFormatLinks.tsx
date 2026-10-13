import React from "react";
import { Link } from "react-router-dom";
import { categoryLabel } from "../../data/templates/categories";
import { trackEvent } from "../../lib/tracker";

const HUB_FORMAT_KEYS = ["poster", "social", "album", "pitch-deck", "resume", "invitation", "flyer"];
const LINK_CLASS =
  "shrink-0 rounded-full border border-[var(--s-border)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--s-text-muted)] no-underline transition-colors hover:border-[var(--s-border-focus)] hover:text-[var(--s-text)]";

const trackFormatClick = (category: string): void => {
  trackEvent("nav", "hub_format_clicked", { details: { category } });
};

export const HubFormatLinks: React.FC = () => (
  <div className="no-scrollbar -mx-6 mb-5 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
    {HUB_FORMAT_KEYS.map((key) => (
      <Link key={key} to={`/templates/${key}`} onClick={() => trackFormatClick(key)} className={LINK_CLASS}>
        {categoryLabel(key)}
      </Link>
    ))}
    <Link to="/templates" className={`${LINK_CLASS} text-[var(--s-text)]`}>
      All formats
    </Link>
  </div>
);
