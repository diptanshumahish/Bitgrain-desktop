import React from "react";
import type { HubDestination } from "../../../pages/landing-page/HubDestinations";
import { createLinkClickTracker } from "../../../modules/tracking/track-link-click";
import { HubQuickAction } from "./HubQuickAction";

const handleHubTileClick = createLinkClickTracker("nav", "hub_tile_clicked", "hub");

interface HubQuickActionsProps {
  destinations: HubDestination[];
}

export const HubQuickActions: React.FC<HubQuickActionsProps> = ({ destinations }) => (
  <div onClick={handleHubTileClick} className="grid gap-3 sm:grid-cols-3">
    {destinations.map((destination) => (
      <HubQuickAction key={destination.key} destination={destination} />
    ))}
  </div>
);
