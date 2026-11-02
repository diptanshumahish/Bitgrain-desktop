import { useCallback, useEffect, useRef } from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { openPresenterWindow } from "../window/open-presenter-window";
import { postPresenterMessage, presenterChannelName, type PresenterMessage } from "./presenter-messages";
import { streamSlideImages } from "./stream-slide-images";

interface PresenterBroadcastArgs {
  pages: TemplatePage[];
  template: TemplateDef;
  index: number;
  onStep: (delta: number) => void;
}

interface PresenterLinkRefs {
  channel: BroadcastChannel | null;
  presenterWindow: Window | null;
  cache: Map<number, string>;
  startedAt: number;
}

const deckMessage = (args: PresenterBroadcastArgs, startedAt: number): PresenterMessage => ({
  type: "deck",
  slides: args.pages.map((page, position) => ({ name: page.name || `Page ${position + 1}`, notes: page.notes ?? "" })),
  index: args.index,
  startedAt,
});

const closeLink = (link: PresenterLinkRefs): void => {
  postPresenterMessage(link.channel, { type: "end" });
  link.channel?.close();
  link.presenterWindow?.close();
  link.channel = null;
  link.presenterWindow = null;
};

export const usePresenterBroadcast = (args: PresenterBroadcastArgs): (() => void) => {
  const argsRef = useRef(args);
  const linkRef = useRef<PresenterLinkRefs>({ channel: null, presenterWindow: null, cache: new Map(), startedAt: 0 });

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => {
    postPresenterMessage(linkRef.current.channel, { type: "index", index: args.index });
  }, [args.index]);

  useEffect(() => {
    const link = linkRef.current;
    link.startedAt = Date.now();
    return () => closeLink(link);
  }, []);

  const handleMessage = useCallback((channel: BroadcastChannel, message: PresenterMessage): void => {
    const link = linkRef.current;
    const current = argsRef.current;
    if (message.type === "step") current.onStep(message.delta);
    if (message.type !== "hello") return;
    postPresenterMessage(channel, deckMessage(current, link.startedAt));
    void streamSlideImages({
      channel, pages: current.pages, template: current.template, startIndex: current.index,
      cache: link.cache, isCancelled: () => link.channel !== channel,
    });
  }, []);

  return useCallback((): void => {
    const link = linkRef.current;
    if (link.presenterWindow && !link.presenterWindow.closed) {
      link.presenterWindow.focus();
      return;
    }
    link.channel?.close();
    const sessionId = crypto.randomUUID();
    const channel = new BroadcastChannel(presenterChannelName(sessionId));
    channel.onmessage = (event: MessageEvent<PresenterMessage>) => handleMessage(channel, event.data);
    link.channel = channel;
    link.presenterWindow = openPresenterWindow(sessionId);
    if (link.presenterWindow) {
      trackEvent("studio", "presenter_view_opened", { details: { page_count: argsRef.current.pages.length } });
      return;
    }
    closeLink(link);
    emitStatusToast({ title: "Presenter view was blocked", detail: "Allow pop-ups for Bitgrain, then try again." });
  }, [handleMessage]);
};
