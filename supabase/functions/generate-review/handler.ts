/**
 * Framework-free request handler for the `generate-review` function.
 *
 * This is the testable core: it receives its runtime dependencies — including the
 * authenticator — by injection, so the full request lifecycle can be unit-tested
 * deterministically and offline with authentication mocked (no Supabase, network,
 * environment, or database access). The production entrypoint (index.ts) supplies
 * the real dependencies, wiring authentication via `verifyAuth` from
 * `@supabase/server/core`. No Supabase/admin/database client is ever created.
 *
 * Order of guards:
 *   1. CORS preflight (`OPTIONS`) — answered before authentication, since a
 *      preflight request carries no `Authorization` header.
 *   2. Method must be POST.
 *   3. Authentication — the injected authenticator verifies the caller; a failure
 *      collapses to a safe `UNAUTHORIZED` (the raw verifyAuth error is never seen
 *      here). When `verify_jwt = true`, the gateway rejects invalid/missing JWTs
 *      before the function runs; that 401 is gateway-controlled.
 *   4. Raw body must be within the size bound.
 *   5. Body must be present and valid JSON.
 *   6. Body must satisfy the shared request contract.
 * A valid request returns the deterministic stubbed review (docs §5). The
 * submitted code is validated but never executed, transformed, echoed, or logged.
 */

import {
  type GenerateReviewResponse,
  type ReviewApiErrorCode,
  validateGenerateReviewRequest,
} from '@stacktutor/shared';

import type { Authenticator } from './auth.ts';
import { buildCorsHeaders, preflightResponse } from './cors.ts';
import { errorResponse, jsonResponse } from './responses.ts';
import { buildStubReview } from './stub.ts';

/**
 * A safe, structured log event. Carries only non-sensitive metadata: never the
 * submitted code (only its length), never claims, tokens, or secrets (docs §13).
 */
export type ReviewLogEvent =
  | {
    outcome: 'success';
    requestId: string;
    language: string;
    reviewMode: string;
    codeLength: number;
  }
  | { outcome: 'error'; requestId: string; code: ReviewApiErrorCode };

/** Runtime dependencies injected into {@link handleGenerateReview}. */
export type HandlerDeps = {
  /** Verifies the caller and yields the verified identity, or `null` on failure. */
  authenticate: Authenticator;
  /** Browser origins allowed to read responses. */
  allowedOrigins: ReadonlySet<string>;
  /** Generates a per-request correlation id (injected for deterministic tests). */
  newRequestId: () => string;
  /** Upper bound on the raw request body, in bytes, rejected before parsing. */
  maxRawBodyBytes: number;
  /** Sink for safe structured logs. */
  log: (event: ReviewLogEvent) => void;
};

/**
 * True when the request declares a JSON body. The media type must be
 * `application/json` (case-insensitive); RFC 9110 parameters such as
 * `; charset=utf-8` are allowed and ignored. A missing header is not JSON.
 */
function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) {
    return false;
  }
  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json';
}

/**
 * Handles a single `generate-review` request and returns the HTTP response.
 * Pure with respect to its dependencies: all I/O is either reading the request or
 * calling an injected function.
 */
export async function handleGenerateReview(req: Request, deps: HandlerDeps): Promise<Response> {
  const origin = req.headers.get('origin');
  const cors = buildCorsHeaders(origin, deps.allowedOrigins);

  // 1. CORS preflight — answered before authentication (no Authorization header).
  if (req.method === 'OPTIONS') {
    return preflightResponse(origin, deps.allowedOrigins);
  }

  const requestId = deps.newRequestId();
  const fail = (code: ReviewApiErrorCode, extraHeaders: Record<string, string> = {}): Response => {
    deps.log({ outcome: 'error', requestId, code });
    return errorResponse(code, requestId, { ...cors, ...extraHeaders });
  };

  try {
    // 2. Method: review generation is a POST-only command.
    if (req.method !== 'POST') {
      return fail('METHOD_NOT_ALLOWED', { allow: 'POST, OPTIONS' });
    }

    // 3. Authentication via the injected verifier. A verification failure (or an
    // absent identity) maps to a safe UNAUTHORIZED; no raw auth detail is exposed.
    const caller = await deps.authenticate(req);
    if (caller === null) {
      return fail('UNAUTHORIZED');
    }

    // 4. Require a JSON request body. The media type must be application/json
    // (case-insensitive); parameters such as "; charset=utf-8" are accepted. The
    // supplied Content-Type is never echoed back in the error.
    if (!isJsonContentType(req.headers.get('content-type'))) {
      return fail('INVALID_REQUEST');
    }

    // 5. Reject oversized bodies up front. Content-Length is byte-based and a
    // cheap early check; the encoded body size below is the authoritative guard.
    const advertisedLength = Number(req.headers.get('content-length'));
    if (Number.isFinite(advertisedLength) && advertisedLength > deps.maxRawBodyBytes) {
      return fail('PAYLOAD_TOO_LARGE');
    }

    // 6. Body must be present and valid JSON.
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch {
      return fail('INVALID_REQUEST');
    }
    // Enforce the raw-body limit against the actual UTF-8 byte length, not the
    // UTF-16 code-unit count, so multi-byte payloads are measured correctly.
    const rawBodyBytes = new TextEncoder().encode(rawBody).byteLength;
    if (rawBodyBytes > deps.maxRawBodyBytes) {
      return fail('PAYLOAD_TOO_LARGE');
    }
    if (rawBody.length === 0) {
      return fail('INVALID_REQUEST');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return fail('INVALID_REQUEST');
    }

    // 7. Validate against the shared contract. The validator's two failure codes
    // map straight onto HTTP via the shared metadata: INVALID_REQUEST → 400,
    // PAYLOAD_TOO_LARGE → 413.
    const validation = validateGenerateReviewRequest(parsed);
    if (!validation.success) {
      return fail(validation.error.code);
    }

    // Valid, authenticated request. Return the deterministic stub. The validated
    // request is used only for safe metadata logging; its `code` is never echoed
    // or logged, and `caller.id` is the only identity consumed.
    const review = buildStubReview();
    const response: GenerateReviewResponse = { requestId, review };
    deps.log({
      outcome: 'success',
      requestId,
      language: validation.data.language,
      reviewMode: validation.data.reviewMode,
      codeLength: validation.data.code.length,
    });
    return jsonResponse(response, 200, cors);
  } catch {
    // Any unexpected fault maps to a safe INTERNAL_ERROR — no exception detail,
    // stack trace, or submitted code reaches the client.
    return fail('INTERNAL_ERROR');
  }
}
