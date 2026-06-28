/**
 * Tests for the provider-neutral error metadata (docs §12).
 *
 * Run with Node's built-in test runner (`node --test`); no external services.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { ReviewApiErrorCode, ReviewApiErrorMetadata } from './errors.ts';
import { REVIEW_API_ERROR_MESSAGES, REVIEW_API_ERROR_METADATA } from './errors.ts';

/** The expected code -> {status, retryable} table, transcribed from docs §12. */
const EXPECTED: Record<ReviewApiErrorCode, ReviewApiErrorMetadata> = {
  INVALID_REQUEST: { status: 400, retryable: false },
  UNAUTHORIZED: { status: 401, retryable: false },
  METHOD_NOT_ALLOWED: { status: 405, retryable: false },
  PAYLOAD_TOO_LARGE: { status: 413, retryable: false },
  RATE_LIMITED: { status: 429, retryable: true },
  GENERATION_IN_PROGRESS: { status: 429, retryable: true },
  PROVIDER_UNAVAILABLE: { status: 502, retryable: true },
  INVALID_PROVIDER_RESPONSE: { status: 502, retryable: true },
  PROVIDER_TIMEOUT: { status: 504, retryable: true },
  INTERNAL_ERROR: { status: 500, retryable: false },
};

test('maps every documented error code to the correct status and retryability', () => {
  assert.deepEqual(REVIEW_API_ERROR_METADATA, EXPECTED);
});

test('defines a safe, non-empty client message for every error code', () => {
  for (const code of Object.keys(EXPECTED) as ReviewApiErrorCode[]) {
    const message = REVIEW_API_ERROR_MESSAGES[code];
    assert.equal(typeof message, 'string', `missing message for ${code}`);
    assert.ok(message.length > 0, `empty message for ${code}`);
  }
});

test('metadata and messages cover exactly the same set of codes', () => {
  assert.deepEqual(
    Object.keys(REVIEW_API_ERROR_METADATA).sort(),
    Object.keys(REVIEW_API_ERROR_MESSAGES).sort(),
  );
});
