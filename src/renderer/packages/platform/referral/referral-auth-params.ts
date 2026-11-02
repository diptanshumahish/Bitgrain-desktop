import { readReferralCode } from "./referral-code-store";

export function withReferralCode(payload: Record<string, string>): Record<string, string> {
  const code = readReferralCode();
  return code ? { ...payload, ref: code } : payload;
}

export function referralQuerySuffix(): string {
  const code = readReferralCode();
  return code ? `&ref=${encodeURIComponent(code)}` : "";
}
