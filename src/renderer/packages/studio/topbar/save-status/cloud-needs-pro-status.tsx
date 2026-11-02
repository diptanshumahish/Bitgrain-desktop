import React from "react";
import { Link } from "react-router-dom";
import { HardDrive } from "lucide-react";
import { FREE_CLOUD_PROJECT_LIMIT } from "@bitgrain/platform/plans/plan-limits";

const ICON_SIZE = 11;

export const CloudNeedsProStatus: React.FC = () => (
  <span
    role="status"
    title={`Free keeps ${FREE_CLOUD_PROJECT_LIMIT} projects in the cloud. This one is saved in this browser.`}
    className="flex items-center gap-1.5 text-[12px] leading-tight text-[var(--s-text-muted)] whitespace-nowrap"
  >
    <HardDrive size={ICON_SIZE} strokeWidth={2} className="shrink-0" />
    <span>Saved on this device</span>
    <Link to="/pricing" className="font-semibold text-[var(--s-text)] underline underline-offset-2 hover:no-underline">
      Upgrade
    </Link>
  </span>
);
