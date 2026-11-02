import { useEffect, useState } from "react";
import { onHeicStatus, type SpecialImageFormat } from "./darkroom-modal-events";

const HEIC_DONE_LINGER_MS = 900;

interface HeicToastState {
  status: "converting" | "done";
  format: SpecialImageFormat;
}

export const useHeicStatus = (): HeicToastState | null => {
  const [state, setState] = useState<HeicToastState | null>(null);

  useEffect(
    () =>
      onHeicStatus((event) => {
        if (event.status === "failed") {
          setState(null);
          return;
        }
        const status = event.status === "done" ? "done" : "converting";
        setState((current) => ({ status, format: event.format ?? current?.format ?? "heic" }));
        if (event.status === "done") {
          setTimeout(() => setState((current) => (current?.status === "done" ? null : current)), HEIC_DONE_LINGER_MS);
        }
      }),
    [],
  );

  return state;
};
