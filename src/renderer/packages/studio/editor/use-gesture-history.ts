import { useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { canvasGestureSignal } from "./workspace/gesture-freeze";

const PANEL_EDIT_IDLE_MS = 800;

interface PanelEditMark {
  key: string;
  at: number;
}

export interface GestureHistory {
  beginGesture: () => void;
  endGesture: () => void;
  recordPanelEdit: (id: string, updates: Partial<Layer>) => void;
}

const panelEditKey = (id: string, updates: Partial<Layer>): string =>
  `${id}:${Object.keys(updates).sort().join(",")}`;

export function useGestureHistory(pushHistory: () => void): GestureHistory {
  const gestureActiveRef = useRef(false);
  const lastPanelEditRef = useRef<PanelEditMark | null>(null);

  const beginGesture = (): void => {
    if (gestureActiveRef.current) return;
    gestureActiveRef.current = true;
    canvasGestureSignal.value = true;
    lastPanelEditRef.current = null;
    pushHistory();
  };

  const endGesture = (): void => {
    gestureActiveRef.current = false;
    canvasGestureSignal.value = false;
  };

  const recordPanelEdit = (id: string, updates: Partial<Layer>): void => {
    const key = panelEditKey(id, updates);
    const now = Date.now();
    const last = lastPanelEditRef.current;
    lastPanelEditRef.current = { key, at: now };
    if (last && last.key === key && now - last.at < PANEL_EDIT_IDLE_MS) return;
    pushHistory();
  };

  return { beginGesture, endGesture, recordPanelEdit };
}
