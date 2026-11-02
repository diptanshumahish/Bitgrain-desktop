import React from "react";
import { Link } from "react-router-dom";

interface AnnouncementCtaProps {
  label: string;
  url: string;
  onFollow: () => void;
}

const CTA_CLASS =
  "text-[12px] font-semibold text-[var(--s-text)] underline underline-offset-2 hover:no-underline";

export const AnnouncementCta: React.FC<AnnouncementCtaProps> = ({ label, url, onFollow }) => {
  if (url.startsWith("/")) {
    return (
      <Link to={url} onClick={onFollow} className={CTA_CLASS}>
        {label}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onFollow} className={CTA_CLASS}>
      {label}
    </a>
  );
};
