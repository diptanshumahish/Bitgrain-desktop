export type Currency =
  | "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD"
  | "SGD" | "AED" | "MYR" | "BRL" | "MXN" | "PHP";

export type Bundle = "pro-license-10yr" | "pro-monthly" | "pro-annual" | "mcp-render-pack" | "export-pack" | "founder-monthly";

export const LICENSE_BUNDLE: Bundle = "pro-license-10yr";
export const MONTHLY_BUNDLE: Bundle = "pro-monthly";
export const ANNUAL_BUNDLE: Bundle = "pro-annual";
export const RENDER_PACK_BUNDLE: Bundle = "mcp-render-pack";
export const EXPORT_PACK_BUNDLE: Bundle = "export-pack";
export const FOUNDER_BUNDLE: Bundle = "founder-monthly";

export const LICENSE_TERM_YEARS = 10;

export type BillingCycle = "monthly" | "annual" | "lifetime";

export const DEFAULT_BILLING_CYCLE: BillingCycle = "monthly";

interface CurrencyMeta {
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

// All amounts in smallest currency unit (paise / cents). Must mirror the server's defaultBundlePrices.
export const BUNDLE_PRICES: Record<Bundle, Record<Currency, number>> = {
  "pro-license-10yr": {
    INR: 499900, USD: 12900, EUR: 11900, GBP: 10500, AUD: 19500, CAD: 17900,
    SGD: 17500,  AED: 47500, MYR: 57900, BRL: 64900, MXN: 229900, PHP: 729900,
  },
  "pro-monthly": {
    INR: 29900, USD: 699, EUR: 649, GBP: 549, AUD: 1049, CAD: 949,
    SGD: 929,   AED: 2529, MYR: 3089, BRL: 3489, MXN: 12289, PHP: 38989,
  },
  "pro-annual": {
    INR: 199900, USD: 4900, EUR: 4500, GBP: 3900, AUD: 7500, CAD: 6500,
    SGD: 6500,   AED: 17900, MYR: 21900, BRL: 24900, MXN: 85900, PHP: 269900,
  },
  "founder-monthly": {
    INR: 150000, USD: 1099, EUR: 1049, GBP: 849, AUD: 1649, CAD: 1499,
    SGD: 1449,   AED: 3999, MYR: 4899, BRL: 5499, MXN: 19299, PHP: 60999,
  },
  "mcp-render-pack": {
    INR: 39900, USD: 500, EUR: 449, GBP: 399, AUD: 749, CAD: 699,
    SGD: 699,   AED: 1899, MYR: 2299, BRL: 2499, MXN: 8999, PHP: 27900,
  },
  "export-pack": {
    INR: 5000, USD: 199, EUR: 179, GBP: 159, AUD: 299, CAD: 279,
    SGD: 269,  AED: 729, MYR: 899, BRL: 1099, MXN: 3699, PHP: 11500,
  },
};

export const CYCLE_BUNDLE: Record<BillingCycle, Bundle> = {
  monthly: "pro-monthly",
  annual: "pro-annual",
  lifetime: "pro-license-10yr",
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
