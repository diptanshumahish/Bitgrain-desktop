import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { onKitTokenChange, type KitTokenChange } from "../../state/kit-token-bus";
import { refitTextLayer } from "../../layers/text-box/text-box-fit";
import { resyncNumberInPages, resyncTextStyleInPages } from "./resync-kit-tokens";

const HISTORY_IDLE_MS = 800;

interface HistoryMark {
  key: string;
  at: number;
}

interface UseKitTokenResyncArgs {
  pages: TemplatePage[];
  setPages: (pages: TemplatePage[]) => void;
  pushHistory: () => void;
}

const resyncForChange = (pages: TemplatePage[], change: KitTokenChange): TemplatePage[] =>
  change.kind === "textStyle"
    ? resyncTextStyleInPages(pages, change.style, refitTextLayer)
    : resyncNumberInPages(pages, change.token, refitTextLayer);

const changeKey = (change: KitTokenChange): string =>
  change.kind === "textStyle" ? change.style.id : change.token.id;

export const useKitTokenResync = ({ pages, setPages, pushHistory }: UseKitTokenResyncArgs): void => {
  const pagesRef = useRef(pages);
  const setPagesRef = useRef(setPages);
  const pushHistoryRef = useRef(pushHistory);
  const lastMarkRef = useRef<HistoryMark | null>(null);

  useEffect(() => {
    pagesRef.current = pages;
    setPagesRef.current = setPages;
    pushHistoryRef.current = pushHistory;
  });

  useEffect(
    () =>
      onKitTokenChange((change) => {
        const next = resyncForChange(pagesRef.current, change);
        if (next === pagesRef.current) return;
        const key = changeKey(change);
        const now = Date.now();
        const last = lastMarkRef.current;
        if (!last || last.key !== key || now - last.at > HISTORY_IDLE_MS) pushHistoryRef.current();
        lastMarkRef.current = { key, at: now };
        pagesRef.current = next;
        setPagesRef.current(next);
      }),
    [],
  );
};
