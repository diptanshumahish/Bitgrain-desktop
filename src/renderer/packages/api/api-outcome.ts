export type ApiOutcome<T> =
  | { kind: "ok"; data: T }
  | { kind: "not_found" }
  | { kind: "failed"; status?: number };

export const NOT_FOUND_STATUS = 404;
export const PAYMENT_REQUIRED_STATUS = 402;
