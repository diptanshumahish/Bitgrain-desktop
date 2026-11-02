import type { RowRange, ScreenPlan } from "../plugins/halftone/screen-types";

export interface BandRequest {
  id: number;
  plan: ScreenPlan;
  rows: RowRange;
}

export interface BandReply {
  id: number;
  band: Uint8ClampedArray;
}
