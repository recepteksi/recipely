import type { Failure } from '@presentation/base/types';
import { failureToastMessage } from '@presentation/base/errors/failure-content';

/**
 * Resolves the message for an auth form banner. The same failure class means
 * something different on an auth endpoint than elsewhere — a 401 on sign-in is
 * "wrong password", not "session expired"; a 409 on register is "email taken".
 * Callers pass `overrides` keyed by failure `code` for those contextual cases;
 * anything unmapped (network, timeout, server) falls back to the generic
 * class-based copy.
 */
export const authFormMessage = (
  failure: Failure,
  overrides: Partial<Record<string, string>>,
): string => overrides[failure.code] ?? failureToastMessage(failure);
