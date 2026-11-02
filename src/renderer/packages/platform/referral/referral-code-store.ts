const REFERRAL_STORAGE_KEY = "bitgrain_referral_code";
const DAY_MS = 86_400_000;
const REFERRAL_TTL_DAYS = 30;
const REFERRAL_TTL_MS = REFERRAL_TTL_DAYS * DAY_MS;
const REFERRAL_CODE_PATTERN = /^[a-z0-9]{1,32}$/;

interface StoredReferral {
  code: string;
  savedAt: number;
}

export function normalizeReferralCode(raw: string | null): string | null {
  const code = (raw ?? "").trim().toLowerCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function storeReferralCode(code: string): void {
  const entry: StoredReferral = { code, savedAt: Date.now() };
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    return;
  }
}

function parseStoredReferral(raw: string | null): StoredReferral | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredReferral;
  } catch {
    return null;
  }
}

export function readReferralCode(): string | null {
  try {
    const entry = parseStoredReferral(localStorage.getItem(REFERRAL_STORAGE_KEY));
    if (!entry || Date.now() - entry.savedAt > REFERRAL_TTL_MS) return null;
    return normalizeReferralCode(entry.code);
  } catch {
    return null;
  }
}

export function clearReferralCode(): void {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    return;
  }
}
