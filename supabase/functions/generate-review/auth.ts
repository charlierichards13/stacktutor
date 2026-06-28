/**
 * Authentication adapter boundary for the `generate-review` function (docs §3).
 *
 * The endpoint authenticates with the lower-level official primitive
 * `verifyAuth(req, { auth: 'user' })` from `@supabase/server/core` (wired in
 * index.ts). `verifyAuth` only verifies the caller's JWT and returns the verified
 * claims — it does NOT create a Supabase client, an admin client, or a
 * service-role client. This function performs no database work, so none is
 * needed (issue #16; docs §3, §15).
 *
 * This module holds the pure, network-free mapping from the official
 * `verifyAuth` result to the minimal {@link Caller} the handler needs. Identity
 * comes only from the verified token claims — never from the request body. The
 * verification error is treated opaquely: its message/status are internal and are
 * never surfaced to the client (the handler maps a failure to a safe
 * `UNAUTHORIZED`).
 */

import type { verifyAuth } from '@supabase/server/core';

/** The official return shape of `verifyAuth` (a `{ data, error }` result tuple). */
type VerifyAuthReturn = Awaited<ReturnType<typeof verifyAuth>>;

/** The minimal authenticated identity the handler requires. */
export type Caller = {
  /** The authenticated user's id (`UserClaims.id`, i.e. the verified JWT subject). */
  id: string;
};

/**
 * The result shape `verifyAuth` resolves to. The success branch uses the official
 * type (so `data.userClaims` is the real `AuthResult.userClaims`); the failure
 * branch deliberately keeps the error as `unknown` — this function never reads its
 * contents, so no raw auth detail can leak.
 */
export type AuthVerification =
  | Extract<VerifyAuthReturn, { error: null }>
  | { data: null; error: unknown };

/** Authenticates a request, yielding the verified {@link Caller} or `null`. */
export type Authenticator = (req: Request) => Promise<Caller | null>;

/**
 * Maps a {@link verifyAuth} result to a {@link Caller}. Returns `null` on any
 * verification error or when no user identity is present (`userClaims` is `null`
 * for non-user auth modes). Reads only `userClaims.id`; no `sub`/`id` fallback is
 * needed because the official `UserClaims` type exposes the id as `id`.
 */
export function callerFromAuthResult(result: AuthVerification): Caller | null {
  if (result.error !== null || result.data === null) {
    return null;
  }
  const claims = result.data.userClaims;
  return claims === null ? null : { id: claims.id };
}
