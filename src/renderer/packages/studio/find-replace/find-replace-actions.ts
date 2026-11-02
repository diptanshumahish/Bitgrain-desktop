import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { TextMatch } from "./find-matches";
import { applyReplacements } from "./apply-replacements";
import { activeMatchSignal, findPagesSignal, findReplaceBridge, findReplaceOpenSignal, replaceTextSignal } from "./find-replace-state";

export const clampMatchIndex = (index: number, count: number): number => (count === 0 ? -1 : Math.min(Math.max(index, 0), count - 1));

const revealMatch = (match: TextMatch | undefined): void => {
  if (match) findReplaceBridge()?.reveal(match.pageId, match.layerId);
};

export const stepMatch = (matches: TextMatch[], delta: number): void => {
  if (matches.length === 0) return;
  const current = clampMatchIndex(activeMatchSignal.value, matches.length);
  const next = (current + delta + matches.length) % matches.length;
  activeMatchSignal.value = next;
  revealMatch(matches[next]);
};

export const replaceCurrent = (matches: TextMatch[]): void => {
  const match = matches[clampMatchIndex(activeMatchSignal.value, matches.length)];
  const bridge = findReplaceBridge();
  if (!match || !bridge) return;
  bridge.applyPages(applyReplacements(findPagesSignal.value, [match], replaceTextSignal.value));
  revealMatch(match);
  trackEvent("studio", "find_replace_used", { details: { mode: "single" } });
};

export const replaceEvery = (matches: TextMatch[]): void => {
  const bridge = findReplaceBridge();
  if (matches.length === 0 || !bridge) return;
  bridge.applyPages(applyReplacements(findPagesSignal.value, matches, replaceTextSignal.value));
  activeMatchSignal.value = 0;
  emitStatusToast({ title: "Replaced", detail: `${matches.length} ${matches.length === 1 ? "match" : "matches"} updated across your pages.` });
  trackEvent("studio", "find_replace_used", { details: { mode: "all", count: matches.length } });
};

export const closeFindReplace = (): void => {
  findReplaceOpenSignal.value = false;
};
