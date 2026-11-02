import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { signal, useSignalValue } from "@bitgrain/core/signal";
import { onVersionHistory, type VersionHistoryRequest } from "../version-events";
import { VersionHistoryDialog } from "./VersionHistoryDialog";

const historyRequestSignal = signal<VersionHistoryRequest | null>(null);

const closeHistory = (): void => {
  historyRequestSignal.value = null;
};

export const VersionHistoryPortal: React.FC = () => {
  const request = useSignalValue(historyRequestSignal);

  useEffect(
    () =>
      onVersionHistory((next) => {
        historyRequestSignal.value = next;
      }),
    [],
  );

  if (!request) return null;
  return createPortal(<VersionHistoryDialog request={request} onClose={closeHistory} />, document.body);
};
