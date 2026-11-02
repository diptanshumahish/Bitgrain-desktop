import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { BrandIssue } from "./brand-issue";

const BRAND_FIX_KEY = "bg:brand-fix";

const brandFixChannel = createEventChannel<BrandIssue[]>(BRAND_FIX_KEY);

export const emitBrandFix = brandFixChannel.emit;
export const onBrandFix = brandFixChannel.on;
