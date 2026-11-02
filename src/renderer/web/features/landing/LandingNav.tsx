import React from "react";
import { Link } from "react-router-dom";
import { Menu, ArrowUpRight } from "lucide-react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { createLinkClickTracker } from "@bitgrain/platform/analytics/tracking/track-link-click";
import { NAV_LINKS, PRIMARY_TOOL_PATH, SIGNED_IN_HOME, SIGN_IN_PATH } from "./nav/nav-links";
import { emitMobileNav } from "./nav/mobile-nav-events";
import { MobileNavPortal } from "./nav/MobileNavPortal";
import { useNavAccount } from "./nav/use-nav-account";

const handleDesktopNavClick = createLinkClickTracker("nav", "nav_link_clicked", "landing_nav");

const openMobileMenu = (): void => {
  emitMobileNav(true);
  trackEvent("nav", "mobile_menu_opened", { details: { location: "landing_nav" } });
};

type NavVariant = "ultramarine" | "paper" | "ink";

interface LandingNavProps {
  variant?: NavVariant;
}

const CTA_CLASS: Record<NavVariant, string> = {
  ultramarine: "bg-white text-ultramarine hover:bg-apricot",
  paper: "bg-ultramarine text-white hover:bg-ultramarine-deep",
  ink: "bg-apricot text-ink-soft hover:bg-white",
};

const LINK_TONE: Record<NavVariant, string> = {
  ultramarine: "text-white hover:text-white/75",
  paper: "text-ultramarine hover:text-ultramarine-deep",
  ink: "text-white/85 hover:text-apricot",
};

const MENU_BUTTON_TONE: Record<NavVariant, string> = {
  ultramarine: "text-white bg-white/10 hover:bg-white/20",
  paper: "text-ultramarine bg-ultramarine/10 hover:bg-ultramarine/15",
  ink: "text-white bg-white/10 hover:bg-white/20",
};

export const LandingNav: React.FC<LandingNavProps> = ({ variant = "paper" }) => {
  const account = useNavAccount();
  const signedIn = account === "signed-in";
  const linkClass = `px-3 py-2 whitespace-nowrap font-display text-[14px] ${LINK_TONE[variant]} transition-colors no-underline`;

  return (
    <>
      <nav onClick={handleDesktopNavClick} className="relative z-30 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <Link to="/" className="flex items-center no-underline group justify-self-start">
          <img
            src="/bitgrainlogo.png"
            alt="Bitgrain home"
            className="w-9 h-9 rounded-lg transition-transform group-hover:rotate-[-3deg]"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 justify-self-center">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} title={link.description} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 justify-self-end">
          {account === "signed-out" ? (
            <Link to={SIGN_IN_PATH} className={linkClass}>
              Sign in
            </Link>
          ) : null}
          <Link
            to={signedIn ? SIGNED_IN_HOME : PRIMARY_TOOL_PATH}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg font-display text-[14px] font-medium ${CTA_CLASS[variant]} transition-colors no-underline`}
          >
            {signedIn ? "Open Bitgrain" : "Open studio"}
            <ArrowUpRight size={13} strokeWidth={2.25} />
          </Link>
        </div>

        <button
          type="button"
          onClick={openMobileMenu}
          aria-label="Open menu"
          className={`lg:hidden justify-self-end inline-flex items-center justify-center w-10 h-10 rounded-lg ${MENU_BUTTON_TONE[variant]} transition-colors`}
        >
          <Menu size={16} strokeWidth={2} />
        </button>
      </nav>
      <MobileNavPortal />
    </>
  );
};
