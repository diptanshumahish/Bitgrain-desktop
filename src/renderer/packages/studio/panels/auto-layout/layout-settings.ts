import type { AlignItems, JustifyContent, LayoutMode } from "@bitgrain/studio-core/model/studio-types";
import type { ChildSizing, LayoutPadding } from "@bitgrain/studio-core/model/auto-layout-types";

export interface LayoutSettings {
  width: number;
  height: number;
  layout?: LayoutMode;
  gap?: number;
  padding?: number;
  paddingSides?: LayoutPadding;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  wrap?: boolean;
  layoutSizingH?: ChildSizing;
  layoutSizingV?: ChildSizing;
}

export type LayoutSettingsPatch = Partial<Omit<LayoutSettings, "width" | "height">>;

export const MAX_LAYOUT_SPACING = 400;
export const PANEL_ICON_SIZE = 13;
export const PANEL_ICON_STROKE = 1.75;
