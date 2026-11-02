import React from "react";
import { Aperture, Book, BookOpen, GalleryHorizontalEnd, PackageOpen, Settings } from "lucide-react";
import { emitModal } from "../../lib/event-bus";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "../../lib/tracker";

interface MorePopoverProps {
  hasImage: boolean;
  onClose: () => void;
}

const ROW_CLASS = "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed";

const openBatch = (onClose: () => void): void => {
  emitModal({ type: "batch" });
  trackEvent("home", "batch_modal_open");
  trackEvent("home", "modal_opened", { details: { modal: "batch", source: "more_menu" } });
  onClose();
};

export const MorePopover: React.FC<MorePopoverProps> = ({ hasImage, onClose }) => {
  const navigate = useNavigate();
  return (
  <div className="p-2 flex flex-col min-w-[180px] gap-0.5 font-editorial">
    <button type="button" disabled={!hasImage} onClick={() => openBatch(onClose)} className={ROW_CLASS}>
      <PackageOpen size={12} /> Batch edit many images
    </button>
    <button type="button" onClick={() => { trackEvent("home", "nav_to_studio"); navigate("/studio"); }} className={ROW_CLASS}>
      <Aperture size={12} /> Open Studio
    </button>
    <div className="h-px bg-[var(--s-border)] opacity-50 my-0.5" />
    <Link
      to="/docs"
      className={`${ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <Book size={12} /> Documentation
    </Link>
    <a
      href="/blog"
      target="_blank"
      rel="noopener noreferrer"
      className={`${ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <BookOpen size={12} /> Blog
    </a>
    <a
      href="/showcase"
      target="_blank"
      rel="noopener noreferrer"
      className={`${ROW_CLASS} no-underline`}
      onClick={onClose}
    >
      <GalleryHorizontalEnd size={12} /> Showcase
    </a>
    <div className="h-px bg-[var(--s-border)] opacity-50 my-0.5" />
    <button
      onClick={() => { trackEvent("home", "modal_opened", { details: { modal: "settings", source: "more_menu" } }); emitModal({ type: "settings" }); onClose(); }}
      type="button"
      className={ROW_CLASS}
    >
      <Settings size={12} /> Settings
    </button>
  </div>
  );
};
