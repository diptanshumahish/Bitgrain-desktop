import { useCallback, useEffect, useMemo, useRef } from "react";
import { signal, useSignalValue, type WritableSignal } from "@bitgrain/core/signal";
import { postPresenterMessage, presenterChannelName, type PresenterMessage } from "./presenter-messages";
import { INITIAL_PRESENTER_STATE, reducePresenterMessage, type PresenterState } from "./presenter-state";

interface PresenterLink {
  state: PresenterState;
  step: (delta: number) => void;
}

export const usePresenterLink = (sessionId: string): PresenterLink => {
  const stateSignal = useMemo<WritableSignal<PresenterState>>(() => signal(INITIAL_PRESENTER_STATE), []);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(presenterChannelName(sessionId));
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<PresenterMessage>) => {
      stateSignal.value = reducePresenterMessage(stateSignal.value, event.data);
    };
    postPresenterMessage(channel, { type: "hello" });
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [sessionId, stateSignal]);

  const step = useCallback((delta: number): void => {
    postPresenterMessage(channelRef.current, { type: "step", delta });
  }, []);

  return { state: useSignalValue(stateSignal), step };
};
