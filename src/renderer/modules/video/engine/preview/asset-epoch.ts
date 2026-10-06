import { signal } from "../../../../lib/signal";

// Bumped whenever an asset the compositor draws with finishes loading: an
// overlay image decoding, a font becoming available to the text painter.
//
// Frames composed before that moment are wrong (a missing overlay, text drawn in
// the fallback face) and, unlike an edit, nothing about the project changed to
// invalidate them. The preview folds this into its cache key so those frames are
// dropped and recomposed exactly once, instead of the old approach of recomposing
// every frame forever just in case.
export const assetEpochSignal = signal(0);

export function bumpAssetEpoch(): void {
  assetEpochSignal.value++;
}
