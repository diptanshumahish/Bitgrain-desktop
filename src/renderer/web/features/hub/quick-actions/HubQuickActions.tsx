import React from "react";
import type { HubDestination } from "../../landing/HubDestinations";
import { createLinkClickTracker } from "@bitgrain/platform/analytics/tracking/track-link-click";
import { HubQuickAction } from "./HubQuickAction";

const handleHubTileClick = createLinkClickTracker("nav", "hub_tile_clicked", "hub");

interface HubQuickActionsProps {
  destinations: HubDestination[];
}

export const HubQuickActions: React.FC<HubQuickActionsProps> = ({ destinations }) => (
  <div onClick={handleHubTileClick} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {destinations.map((destination) => (
      <HubQuickAction key={destination.key} destination={destination} />
    ))}
  </div>
);
