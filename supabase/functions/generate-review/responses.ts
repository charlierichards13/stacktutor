/**
 * JSON response helpers for the `generate-review` function.
 *
 * Error responses use the shared error contract (docs §12) directly: the code →
 * HTTP status and code → safe message mappings come from `@stacktutor/shared`,
 * so this function never redeclares statuses, messages, or retryability. Client
 * messages are the shared generic strings — the validator's detailed messages
 * are intentionally NOT surfaced, so no request input is ever reflected back.
 */

import {
  REVIEW_API_ERROR_MESSAGES,
  REVIEW_API_ERROR_METADATA,
  type ReviewApiError,
  type ReviewApiErrorCode,
} from '@stacktutor/shared';

/** Content type for every JSON body this function returns. */
export const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

/** Serializes `body` as JSON with the given status and extra (e.g. CORS) headers. */
export function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': JSON_CONTENT_TYPE, ...extraHeaders },
  });
}

/**
 * Builds a safe {@link ReviewApiError} response for a handler-controlled error.
 * The HTTP status and `retryable` flag come from the shared metadata; the
 * message is the shared, generic, client-facing string for the code. The body
 * carries only `code`, `message`, `requestId`, and `retryable` — never stack
 * traces, exceptions, claims, secrets, or submitted code.
 */
export function errorResponse(
  code: ReviewApiErrorCode,
  requestId: string,
  extraHeaders: Record<string, string> = {},
): Response {
  const metadata = REVIEW_API_ERROR_METADATA[code];
  const body: ReviewApiError = {
    error: {
      code,
      message: REVIEW_API_ERROR_MESSAGES[code],
      requestId,
      retryable: metadata.retryable,
    },
  };
  return jsonResponse(body, metadata.status, extraHeaders);
}
