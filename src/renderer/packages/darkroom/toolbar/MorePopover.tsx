import React from "react";
import { Aperture, Book, BookOpen, Bug, ChefHat, Eraser, GalleryHorizontalEnd, Moon, PackageOpen, Settings } from "lucide-react";
import { toggleTheme } from "@bitgrain/ui/theme/global-theme-store";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { emitDarkroomModal } from "../modals/darkroom-modal-events";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "@bitgrain/platform/tracker";
import { openMetadataCleaner } from "../metadata-cleaner/open-metadata-cleaner";

interface MorePopoverProps {
  hasImage: boolean;
  onClose: () => void;
  leadingItems?: React.ReactNode;
}

export const MORE_ROW_CLASS = "flex items-center gap-3 md:gap-2 px-3 md:px-2 min-h-11 md:min-h-0 py-1.5 rounded-lg text-[14px] md:text-[12px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed";

const openTicket = (onClose: () => void): void => {
  emitPlatformModal({ type: "ticket" });
  onClose();
};

const openBatch = (onClose: () => void): void => {
  emitDarkroomModal({ type: "batch" });
  trackEvent("home", "batch_modal_open");
  trackEvent("home", "modal_opened", { details: { modal: "batch", source: "more_menu" } });
  onClose();
};

export const MorePopover: React.FC<MorePopoverProps> = ({ hasImage, onClose, leadingItems }) => {
  const navigate = useNavigate();
  return (
  <div className="p-2 flex flex-col min-w-[180px] gap-0.5 font-editorial">
    {leadingItems}
    <button type="button" disabled={!hasImage} onClick={() => openBatch(onClose)} className={MORE_ROW_CLASS}>
      <PackageOpen size={12} /> Batch edit many images
    </button>
    <button type="button" onClick={() => { openMetadataCleaner("editor"); onClose(); }} className={MORE_ROW_CLASS}>
      <Eraser size={12} /> Clean image metadata
    </button>
    <button type="button" onClick={() => { trackEvent("home", "nav_to_studio"); navigate("/studio"); }} className={MORE_ROW_CLASS}>
      <Aperture size={12} /> Open Studio
    </button>
    <div className="h-px bg-[var(--s-border)] opacity-50 my-0.5" />
    <Link
      to="/docs"
      className={`${MORE_ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <Book size={12} /> Documentation
    </Link>
    <a
      href="/blog"
      target="_blank"
      rel="noopener noreferrer"
      className={`${MORE_ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <BookOpen size={12} /> Blog
    </a>
    <a
      href="/showcase"
      target="_blank"
      rel="noopener noreferrer"
      className={`${MORE_ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <GalleryHorizontalEnd size={12} /> Showcase
    </a>
    <a href="/recipes" className={`${MORE_ROW_CLASS} no-underline`} onClick={onClose}>
      <ChefHat size={12} /> Community recipes
    </a>
    <div className="h-px bg-[var(--s-border)] opacity-50 my-0.5" />
    <button
      onClick={() => { trackEvent("home", "nav_to_settings", { details: { source: "more_menu" } }); onClose(); navigate("/account"); }}
      type="button"
      className={MORE_ROW_CLASS}
    >
      <Settings size={12} /> Settings
    </button>
    <button type="button" onClick={() => { toggleTheme(); onClose(); }} className={`${MORE_ROW_CLASS} hidden md:flex`}>
      <Moon size={12} /> Switch light or dark
    </button>
    <button type="button" onClick={() => openTicket(onClose)} className={MORE_ROW_CLASS}>
      <Bug size={12} /> Report a bug or ask for a feature
    </button>
  </div>
  );
};
