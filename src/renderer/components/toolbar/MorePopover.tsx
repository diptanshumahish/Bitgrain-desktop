import React from "react";
import { Book, BookOpen, GalleryHorizontalEnd, Settings } from "lucide-react";
import { emitModal } from "../../lib/event-bus";
import { Link } from "react-router-dom";

interface MorePopoverProps {
  onClose: () => void;
}

export const MorePopover: React.FC<MorePopoverProps> = ({ onClose }) => (
  <div className="p-2 flex flex-col min-w-[160px] gap-0.5 font-editorial">
    <Link
      to="/docs"
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all no-underline"
      onClick={onClose}
    >
      <Book size={11} /> Documentation
    </Link>
    <a
      href="/blog"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all no-underline"
      onClick={onClose}
    >
      <BookOpen size={11} /> Blog
    </a>
    <a
      href="/showcase"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all no-underline"
      onClick={onClose}
    >
      <GalleryHorizontalEnd size={11} /> Showcase
    </a>
    <div className="h-px bg-[var(--s-border)] opacity-50 my-0.5" />
    <button
      onClick={() => { emitModal({ type: "settings" }); onClose(); }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-all text-left"
    >
      <Settings size={11} /> Settings
    </button>
  </div>
);
