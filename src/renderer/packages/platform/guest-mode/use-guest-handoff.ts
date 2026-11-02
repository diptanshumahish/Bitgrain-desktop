import { useEffect, useRef } from "react";
import { useIsGuest } from "./use-is-guest";
import { registerGuestHandoff } from "./guest-handoff";

interface UseGuestHandoffArgs {
  resumePath: string | null;
  persist: () => Promise<unknown>;
}

export function useGuestHandoff({ resumePath, persist }: UseGuestHandoffArgs): boolean {
  const guest = useIsGuest();
  const persistRef = useRef(persist);

  useEffect(() => {
    persistRef.current = persist;
  });

  useEffect(() => {
    if (!guest || !resumePath) return undefined;
    return registerGuestHandoff(async () => {
      await persistRef.current();
      return resumePath;
    });
  }, [guest, resumePath]);

  return guest;
}
