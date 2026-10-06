import type { Currency } from "../utils/currency";

export const PAYPAL_SUPPORTED_CURRENCIES: ReadonlyArray<Currency> = [
  "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "BRL", "MXN", "PHP", "MYR",
];

export function supportsPayPal(currency: Currency): boolean {
  return PAYPAL_SUPPORTED_CURRENCIES.includes(currency);
}
