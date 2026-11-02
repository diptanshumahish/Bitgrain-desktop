import React from "react";
import { WorkspaceOverview } from "../workspace-panel/workspace-overview";
import { CanvasSettings } from "../workspace-panel/canvas-settings";
import { DesignKitList } from "../workspace-panel/design-kit-list";
import { StudioTips } from "../workspace-panel/studio-tips";
import { QuickKeysGrid } from "../workspace-panel/quick-keys-grid";

interface PageCanvasPanelProps {
  pageCount?: number;
  layerCount?: number;
}

export const PageCanvasPanel: React.FC<PageCanvasPanelProps> = ({ pageCount = 1, layerCount = 0 }) => (
  <div className="flex flex-col font-editorial pb-4">
    <WorkspaceOverview pageCount={pageCount} layerCount={layerCount} />
    <CanvasSettings />
    <DesignKitList />
    <StudioTips />
    <QuickKeysGrid />
  </div>
);
