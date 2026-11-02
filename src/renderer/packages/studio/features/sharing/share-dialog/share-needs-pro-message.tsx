import React from "react";
import { Link } from "react-router-dom";
import { FREE_CLOUD_PROJECT_LIMIT } from "@bitgrain/platform/plans/plan-limits";

export const ShareNeedsProMessage: React.FC = () => (
  <p role="alert" className="text-[12px] text-[var(--s-text-muted)]">
    Saved on this device. The free plan keeps {FREE_CLOUD_PROJECT_LIMIT} projects in the cloud, and share links need the
    design in the cloud.{" "}
    <Link to="/pricing" className="font-semibold text-[var(--s-text)] underline underline-offset-2 hover:no-underline">
      Upgrade
    </Link>
  </p>
);
