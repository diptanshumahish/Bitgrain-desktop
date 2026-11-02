import { useEffect } from "react";
import type { AuthUser } from "../../../../hooks/useAuth";
import { emitWelcome } from "../welcome-events";
import { isWelcomeEligible, markWelcomeSeen } from "../welcome-eligibility";

const FALLBACK_FIRST_NAME = "there";

const nameParts = (user: AuthUser): string[] => (user.name ?? "").trim().split(/\s+/).filter(Boolean);

const firstNameOf = (user: AuthUser): string => nameParts(user)[0] ?? FALLBACK_FIRST_NAME;

const lastNameOf = (user: AuthUser): string => nameParts(user).slice(1).join(" ");

export const useWelcomeAutostart = (user: AuthUser | null): void => {
  useEffect(() => {
    if (!user || !isWelcomeEligible(user)) return;
    markWelcomeSeen();
    emitWelcome({ firstName: firstNameOf(user), lastName: lastNameOf(user) });
  }, [user]);
};
