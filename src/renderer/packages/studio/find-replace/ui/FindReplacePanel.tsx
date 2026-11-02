import React, { useMemo } from "react";
import { CaseSensitive, ChevronDown, ChevronUp, WholeWord, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { findMatches } from "../find-matches";
import {
  activeMatchSignal,
  findPagesSignal,
  findQuerySignal,
  matchCaseSignal,
  replaceTextSignal,
  wholeWordSignal,
} from "../find-replace-state";
import { clampMatchIndex, closeFindReplace, replaceCurrent, replaceEvery, stepMatch } from "../find-replace-actions";
import { FindIconButton } from "./find-icon-button";
import { FindTextField } from "./find-text-field";

const NEXT = 1;
const PREVIOUS = -1;

const matchLabel = (index: number, count: number, query: string): string => {
  if (!query) return "Type to search every page";
  if (count === 0) return "No matches";
  return `${index + 1} of ${count}`;
};

export const FindReplacePanel: React.FC = () => {
  const pages = useSignalValue(findPagesSignal);
  const query = useSignalValue(findQuerySignal);
  const replacement = useSignalValue(replaceTextSignal);
  const matchCase = useSignalValue(matchCaseSignal);
  const wholeWord = useSignalValue(wholeWordSignal);
  const active = useSignalValue(activeMatchSignal);
  const matches = useMemo(() => findMatches(pages, { query, matchCase, wholeWord }), [pages, query, matchCase, wholeWord]);
  const index = clampMatchIndex(active, matches.length);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") closeFindReplace();
  };
  const onFindKey = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown(event);
    if (event.key === "Enter") stepMatch(matches, event.shiftKey ? PREVIOUS : NEXT);
  };
  const onReplaceKey = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown(event);
    if (event.key === "Enter") replaceCurrent(matches);
  };

  return (
    <div
      role="dialog"
      aria-label="Find and replace"
      data-popover-root
      onKeyDown={onKeyDown}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[9000] w-[360px] max-w-[calc(100vw-32px)] flex flex-col gap-2 p-3 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--s-text)]">Find and replace</span>
        <FindIconButton Icon={X} title="Close" onClick={closeFindReplace} />
      </div>
      <FindTextField label="Find" value={query} autoFocus onChange={(value) => { findQuerySignal.value = value; activeMatchSignal.value = 0; }} onKeyDown={onFindKey}>
        <FindIconButton Icon={CaseSensitive} title="Match case" active={matchCase} onClick={() => { matchCaseSignal.value = !matchCase; }} />
        <FindIconButton Icon={WholeWord} title="Whole word" active={wholeWord} onClick={() => { wholeWordSignal.value = !wholeWord; }} />
      </FindTextField>
      <FindTextField label="Replace with" value={replacement} onChange={(value) => { replaceTextSignal.value = value; }} onKeyDown={onReplaceKey} />
      <div className="flex items-center gap-1">
        <span className="flex-1 text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]">{matchLabel(index, matches.length, query)}</span>
        <FindIconButton Icon={ChevronUp} title="Previous match" disabled={matches.length === 0} onClick={() => stepMatch(matches, PREVIOUS)} />
        <FindIconButton Icon={ChevronDown} title="Next match" disabled={matches.length === 0} onClick={() => stepMatch(matches, NEXT)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={matches.length === 0} onClick={() => replaceCurrent(matches)} className="h-8 rounded-lg border border-[var(--s-border)] bg-transparent text-[12px] font-medium text-[var(--s-text)] cursor-pointer hover:bg-[var(--s-bg-input-hover)] disabled:opacity-35 disabled:cursor-default">
          Replace
        </button>
        <button type="button" disabled={matches.length === 0} onClick={() => replaceEvery(matches)} className="h-8 rounded-lg border-none bg-[var(--s-accent)] text-[12px] font-medium text-[var(--s-accent-text)] cursor-pointer disabled:opacity-35 disabled:cursor-default">
          Replace all
        </button>
      </div>
    </div>
  );
};
