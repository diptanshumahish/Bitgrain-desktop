const GUEST_CLAIMS_KEY = "bg:checkout:guest-claims";
const MAX_STORED_CLAIMS = 5;

export const readGuestClaims = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(GUEST_CLAIMS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((token): token is string => typeof token === "string") : [];
  } catch {
    return [];
  }
};

export const rememberGuestClaim = (token: string): void => {
  const kept = readGuestClaims().filter((stored) => stored !== token);
  try {
    localStorage.setItem(GUEST_CLAIMS_KEY, JSON.stringify([token, ...kept].slice(0, MAX_STORED_CLAIMS)));
  } catch {
    return;
  }
};

export const forgetGuestClaims = (): void => {
  try {
    localStorage.removeItem(GUEST_CLAIMS_KEY);
  } catch {
    return;
  }
};
