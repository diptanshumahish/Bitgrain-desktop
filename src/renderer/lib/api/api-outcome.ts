export type ApiOutcome<T> =
  | { kind: "ok"; data: T }
  | { kind: "not_found" }
  | { kind: "failed" };

export const NOT_FOUND_STATUS = 404;
