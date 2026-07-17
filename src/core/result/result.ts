/**
 * Either-like discriminated union: every fallible operation in domain and
 * application code returns a `Result` instead of throwing.
 */
export type Result<T, F> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly failure: F };
