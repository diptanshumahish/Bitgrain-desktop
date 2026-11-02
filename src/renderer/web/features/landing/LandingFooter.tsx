import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createLinkClickTracker } from "@bitgrain/platform/analytics/tracking/track-link-click";
import { useSignalValue } from "@bitgrain/core/signal";
import { loadRecipesAvailability, recipesAvailableSignal } from "../recipes/list/recipes-availability";
import { LEGAL_LINKS, RECIPES_PATH } from "./nav/footer-links";
import { SUPPORT_EMAIL } from "@bitgrain/platform/legal/legal-constants";
import { MarineShore } from "./marketing/marine/wave/MarineShore";
import { MARINE_SECTION_INNER_CLASS } from "./marketing/marine/marine-classes";
import { FOOTER_COLUMNS } from "./nav/footer-columns";
import { RoughWordmark } from "./marketing/marine/footer/RoughWordmark";
import { scrollPageToTop } from "./nav/scroll-page-to-top";

const handleFooterLinkClick = createLinkClickTracker("nav", "footer_link_clicked", "landing_footer");

const LINK_CLASS = "text-ultramarine/80 hover:text-ultramarine no-underline transition-colors";

export const LandingFooter: React.FC = () => {
  const recipesAvailable = useSignalValue(recipesAvailableSignal);

  useEffect(() => {
    void loadRecipesAvailability();
  }, []);

  return (
    <footer onClick={handleFooterLinkClick} className="bg-ultramarine">
      <MarineShore />
      <div className="bg-apricot pt-16 sm:pt-20">
        <div className={`${MARINE_SECTION_INNER_CLASS} grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12`}>
          <div className="max-w-sm">
            <p className="font-display font-medium text-ultramarine text-[26px] leading-[1.2] tracking-[-0.025em]">
              Shipped solo. Made by hand in the browser.
            </p>
            <p className="mt-5 text-ultramarine/80 text-[15px]">
              Questions or feedback? Write to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ultramarine underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="font-display font-medium text-ultramarine text-[15px]">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
                  {column.links
                    .filter((link) => link.to !== RECIPES_PATH || recipesAvailable)
                    .map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} onClick={scrollPageToTop} className={LINK_CLASS}>{link.label}</Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={`${MARINE_SECTION_INNER_CLASS} mt-20 sm:mt-28`}>
          <RoughWordmark />
        </div>

        <div className={`${MARINE_SECTION_INNER_CLASS} py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[14px]`}>
          <p className="text-ultramarine/70">Every pixel made by an algorithm you can read.</p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={scrollPageToTop} className={LINK_CLASS}>{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
