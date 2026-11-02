import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { createLinkClickTracker } from "@bitgrain/platform/analytics/tracking/track-link-click";
import { emitMobileNav, onMobileNav } from "./mobile-nav-events";
import { NAV_LINKS, PRIMARY_TOOL_PATH, SIGNED_IN_HOME, SIGN_IN_PATH } from "./nav-links";
import { useNavAccount } from "./use-nav-account";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

const handleMobileNavClick = createLinkClickTracker("nav", "nav_link_clicked", "landing_nav_mobile");
const closeMenu = (): void => emitMobileNav(false);

export const MobileNavPortal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const account = useNavAccount();
  const signedIn = account === "signed-in";

  useEffect(() => onMobileNav(setOpen), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${MODAL_LAYER} lg:hidden bg-paper font-display flex flex-col`}
      onClick={handleMobileNavClick}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="px-6 py-6 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="no-underline">
          <img src="/bitgrainlogo.png" alt="Bitgrain home" className="w-9 h-9 rounded-md" />
        </Link>
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close menu"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-ultramarine/10 text-ultramarine"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 px-6 py-2 flex flex-col gap-1 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <Link key={link.to} to={link.to} onClick={closeMenu} className="py-2.5 no-underline">
            <span className="block text-[24px] font-medium text-ultramarine">{link.label}</span>
            <span className="block text-[14px] text-ink-soft/60">{link.description}</span>
          </Link>
        ))}
      </div>

      <div className="px-6 pt-4 pb-8 flex flex-col gap-2.5 border-t border-stone">
        {account === "signed-out" ? (
          <Link
            to={SIGN_IN_PATH}
            onClick={closeMenu}
            className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-ultramarine/10 text-ultramarine text-[16px] font-medium hover:bg-ultramarine/15 no-underline transition-colors"
          >
            Sign in
          </Link>
        ) : null}
        <Link
          to={signedIn ? SIGNED_IN_HOME : PRIMARY_TOOL_PATH}
          onClick={closeMenu}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-ultramarine text-white text-[16px] font-medium hover:bg-ultramarine-deep no-underline transition-colors"
        >
          {signedIn ? "Open Bitgrain" : "Open studio"}
          <ArrowUpRight size={14} strokeWidth={2.25} />
        </Link>
      </div>
    </div>,
    document.body,
  );
};
