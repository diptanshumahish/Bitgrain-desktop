export type Currency =
  | "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD"
  | "SGD" | "AED" | "MYR" | "BRL" | "MXN" | "PHP";

export type Bundle = "pro-license-10yr" | "pro-monthly";

export const LICENSE_BUNDLE: Bundle = "pro-license-10yr";
export const MONTHLY_BUNDLE: Bundle = "pro-monthly";

export const LICENSE_TERM_YEARS = 10;

export type BillingCycle = "lifetime" | "monthly";

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  label: string;
  flag: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "INR", symbol: "₹",    label: "Indian Rupee",        flag: "🇮🇳" },
  { code: "USD", symbol: "$",    label: "US Dollar",           flag: "🇺🇸" },
  { code: "EUR", symbol: "€",    label: "Euro",                flag: "🇪🇺" },
  { code: "GBP", symbol: "£",    label: "British Pound",       flag: "🇬🇧" },
  { code: "AUD", symbol: "A$",   label: "Australian Dollar",   flag: "🇦🇺" },
  { code: "CAD", symbol: "C$",   label: "Canadian Dollar",     flag: "🇨🇦" },
  { code: "SGD", symbol: "S$",   label: "Singapore Dollar",    flag: "🇸🇬" },
  { code: "AED", symbol: "AED ", label: "UAE Dirham",          flag: "🇦🇪" },
  { code: "MYR", symbol: "RM ",  label: "Malaysian Ringgit",   flag: "🇲🇾" },
  { code: "BRL", symbol: "R$",   label: "Brazilian Real",      flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$",  label: "Mexican Peso",        flag: "🇲🇽" },
  { code: "PHP", symbol: "₱",    label: "Philippine Peso",     flag: "🇵🇭" },
];

// All amounts in smallest currency unit (paise / cents). One-time price for the 10-year Pro license.
// Must mirror the server's defaultBundlePrices for "pro-license-10yr".
export const BUNDLE_PRICES: Record<Bundle, Record<Currency, number>> = {
  "pro-license-10yr": {
    INR: 299900, USD: 6900, EUR: 6400, GBP: 5500, AUD: 10500, CAD: 9500,
    SGD: 9300,   AED: 25300, MYR: 30900, BRL: 34900, MXN: 122900, PHP: 389900,
  },
  "pro-monthly": {
    INR: 29900, USD: 699, EUR: 649, GBP: 549, AUD: 1049, CAD: 949,
    SGD: 929,   AED: 2529, MYR: 3089, BRL: 3489, MXN: 12289, PHP: 38989,
  },
};

export function formatCurrencyAmount(amountSmallest: number, currency: Currency): string {
  const meta = CURRENCIES.find((c) => c.code === currency)!;
  const amount = amountSmallest / 100;
  if (currency === "INR") return `${meta.symbol}${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
  return `${meta.symbol}${amount.toFixed(2)}`;
}

// Default display currency is USD everywhere except India, which sees INR.
// Every other currency stays available as a manual choice at checkout.
export function detectCurrency(): Currency {
  const lang = navigator.language || "";
  const countryCode = (lang.split("-")[1] || "").toUpperCase();
  if (countryCode === "IN") return "INR";

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
  } catch {
    // ignore
  }

  return "USD";
}
