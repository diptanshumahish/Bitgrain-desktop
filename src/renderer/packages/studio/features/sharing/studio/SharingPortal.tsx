import React, { Suspense, lazy, useEffect } from "react";
import { createPortal } from "react-dom";
import { signal, useSignalValue } from "@bitgrain/core/signal";
import { onShareDialog, type ShareDialogRequest } from "./sharing-events";

const ShareDialog = lazy(() => import("../share-dialog/ShareDialog").then((m) => ({ default: m.ShareDialog })));

const shareRequestSignal = signal<ShareDialogRequest | null>(null);

const closeShare = (): void => {
  shareRequestSignal.value = null;
};

export const SharingPortal: React.FC = () => {
  const shareRequest = useSignalValue(shareRequestSignal);

  useEffect(() => {
    const stopShare = onShareDialog((request) => {
      shareRequestSignal.value = request;
    });
    return () => {
      stopShare();
      closeShare();
    };
  }, []);

  if (!shareRequest) return null;
  return createPortal(
    <Suspense fallback={null}>
      <ShareDialog projectId={shareRequest.projectId} syncNow={shareRequest.syncNow} onClose={closeShare} />
    </Suspense>,
    document.body,
  );
};
