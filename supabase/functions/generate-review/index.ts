/**
 * Runtime entrypoint for the authenticated `generate-review` Edge Function.
 *
 * This file holds only the Supabase runtime wiring; all request behavior lives in
 * the framework-free, unit-tested `handleGenerateReview` (handler.ts).
 *
 * Authentication uses the lower-level official primitive `verifyAuth` from
 * `@supabase/server/core` with `auth: 'user'`. `verifyAuth` verifies the caller's
 * JWT and returns the verified claims WITHOUT creating any Supabase client — we
 * deliberately avoid the full `withSupabase` context (which exposes `ctx.supabase`
 * and a service-role `ctx.supabaseAdmin`) because this function performs no
 * database work (issue #16; docs §3, §15). No context client, admin client,
 * service-role client, or database client is ever created here.
 *
 * The Supabase gateway also enforces `verify_jwt = true`, so invalid/missing JWTs
 * are rejected before this function runs (that 401 is gateway-controlled). When a
 * request does reach the function, a verifyAuth failure collapses to a safe shared
 * `UNAUTHORIZED`; the raw verifyAuth error is never surfaced.
 *
 * CORS is handled solely by the custom allowlist (cors.ts) — there is no library
 * CORS layer here (unlike `withSupabase`, whose default `cors: true` would add
 * its own headers).
 *
 * References (official):
 *   - Securing Edge Functions: https://supabase.com/docs/guides/functions/auth
 *   - @supabase/server core (verifyAuth): https://github.com/supabase/server
 */

import { verifyAuth } from '@supabase/server/core';

import { type Authenticator, callerFromAuthResult } from './auth.ts';
import { getAllowedOrigins } from './cors.ts';
import { handleGenerateReview, type HandlerDeps, type ReviewLogEvent } from './handler.ts';

/**
 * Raw request body byte cap. Comfortably above any valid request (the contract's
 * 12,000-character `code` plus JSON overhead and multi-byte expansion) while
 * cheaply rejecting absurd payloads before parsing. The precise per-field length
 * limit is enforced by the shared validator.
 */
const MAX_RAW_BODY_BYTES = 256 * 1024;

/**
 * Allowed browser origins. Hosted Supabase functions set `DENO_DEPLOYMENT_ID`, so
 * its absence marks local development — only then are the localhost/127.0.0.1 dev
 * origins included. Production browser origins come solely from
 * `ADDITIONAL_ALLOWED_ORIGINS`.
 */
const includeDevelopmentOrigins = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;
const allowedOrigins = getAllowedOrigins(
  Deno.env.get('ADDITIONAL_ALLOWED_ORIGINS') ?? undefined,
  includeDevelopmentOrigins,
);

/** Emits a safe structured log line. Never receives submitted code or secrets. */
function safeLog(event: ReviewLogEvent): void {
  console.log(JSON.stringify({ fn: 'generate-review', ...event }));
}

/**
 * Production authenticator: verifies the caller's JWT with `verifyAuth` and yields
 * only the verified user id. No client is created; a verification failure becomes
 * `null`, which the handler maps to a safe `UNAUTHORIZED`.
 */
const authenticate: Authenticator = async (req) =>
  callerFromAuthResult(await verifyAuth(req, { auth: 'user' }));

const deps: HandlerDeps = {
  authenticate,
  allowedOrigins,
  newRequestId: () => crypto.randomUUID(),
  maxRawBodyBytes: MAX_RAW_BODY_BYTES,
  log: safeLog,
};

export default {
  fetch: (req: Request): Promise<Response> => handleGenerateReview(req, deps),
};
