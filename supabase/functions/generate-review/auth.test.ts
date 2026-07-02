/**
 * Tests for the authentication adapter boundary (docs §3).
 *
 * The unit under test is the pure, network-free mapping from the official
 * `verifyAuth` result to the handler's minimal {@link Caller}. The real
 * `verifyAuth` network/JWKS verification is wired in index.ts and is mocked in
 * these tests (no remote Supabase project is contacted). Identity is derived only
 * from verified token claims, and verification errors are treated opaquely.
 */

import { assertEquals } from '@std/assert';

import { type AuthVerification, callerFromAuthResult } from './auth.ts';

/** A successful verifyAuth result for a `user`-mode request. */
function success(id: string): AuthVerification {
  return {
    data: {
      authMode: 'user',
      token: 'verified.jwt.token',
      userClaims: { id, role: 'authenticated', email: 'student@example.com' },
      jwtClaims: { sub: id, role: 'authenticated' },
    },
    error: null,
  };
}

Deno.test('callerFromAuthResult maps a verified user to its id (success mapping)', () => {
  assertEquals(callerFromAuthResult(success('d0f1a2b3-1111-2222-3333-444455556666')), {
    id: 'd0f1a2b3-1111-2222-3333-444455556666',
  });
});

Deno.test('callerFromAuthResult maps a verification failure to null (no detail read)', () => {
  // A realistic AuthError carries a message/status we must never surface; the
  // mapper returns null without reading either.
  const failure: AuthVerification = {
    data: null,
    error: { name: 'InvalidCredentialsError', status: 401, message: 'jwt expired: leaked-detail' },
  };
  assertEquals(callerFromAuthResult(failure), null);
});

Deno.test('callerFromAuthResult returns null when no user identity is present', () => {
  // Non-user auth modes resolve with userClaims === null.
  const noUser: AuthVerification = {
    data: { authMode: 'none', token: null, userClaims: null, jwtClaims: null },
    error: null,
  };
  assertEquals(callerFromAuthResult(noUser), null);
});
