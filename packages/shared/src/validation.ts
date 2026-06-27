/**
 * Pure request validation for the `generate-review` API (docs §4).
 *
 * `validateGenerateReviewRequest` accepts `unknown` (e.g. the result of
 * `JSON.parse`) and returns a discriminated union that TypeScript narrows
 * safely. It never throws for expected validation failures, performs no I/O,
 * and never contacts Supabase, an AI provider, or any network service.
 *
 * On success the submitted `code` is returned exactly as received — no trimming
 * or rewriting of meaningful whitespace (docs §4, normalization note).
 */

import type { GenerateReviewRequest } from './contract.ts';
import {
  MAX_CODE_LENGTH,
  REVIEW_LANGUAGES,
  REVIEW_MODES,
  isReviewLanguage,
  isReviewMode,
} from './constants.ts';

/** Validation can only fail with one of these two contract error codes. */
export type ValidationFailureCode = 'INVALID_REQUEST' | 'PAYLOAD_TOO_LARGE';

/** A successful validation carrying the typed, unmodified request. */
export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

/** A failed validation carrying a safe, typed error. */
export type ValidationFailure = {
  success: false;
  error: {
    code: ValidationFailureCode;
    message: string;
  };
};

/** Discriminated union result; narrow on `success` before reading. */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/** The exact, complete set of fields a request may contain. */
const ALLOWED_FIELDS = ['language', 'reviewMode', 'code'] as const;
const ALLOWED_FIELD_SET: ReadonlySet<string> = new Set(ALLOWED_FIELDS);

function invalid(message: string): ValidationFailure {
  return { success: false, error: { code: 'INVALID_REQUEST', message } };
}

function tooLarge(message: string): ValidationFailure {
  return { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message } };
}

/**
 * True only for a plain object literal: rejects `null`, arrays, class
 * instances, and objects with an unusual prototype (e.g. `Object.create(null)`
 * or a custom prototype). Requiring the prototype to be exactly
 * `Object.prototype` blocks prototype-pollution and class-instance smuggling.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Validates an untrusted request body against the contract in docs §4. Checks
 * run cheapest-first and short-circuit on the first failure.
 */
export function validateGenerateReviewRequest(
  input: unknown,
): ValidationResult<GenerateReviewRequest> {
  // 1-4: must be a plain object (rejects null, arrays, class instances, and
  // unusual/unsafe prototypes).
  if (!isPlainObject(input)) {
    return invalid('Request body must be a JSON object.');
  }

  // 7: reject any unexpected field, including symbol-keyed or non-enumerable
  // own keys (Reflect.ownKeys also surfaces a JSON-parsed "__proto__" own key).
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== 'string' || !ALLOWED_FIELD_SET.has(key)) {
      return invalid(`Unexpected field: ${String(key)}.`);
    }
  }

  // 5-6: every required field must be present.
  for (const field of ALLOWED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) {
      return invalid(`Missing required field: ${field}.`);
    }
  }

  // 8: language must match the enum exactly.
  const { language, reviewMode, code } = input;
  if (!isReviewLanguage(language)) {
    return invalid(`Field "language" must be one of: ${REVIEW_LANGUAGES.join(', ')}.`);
  }

  // 9: reviewMode must match the enum exactly.
  if (!isReviewMode(reviewMode)) {
    return invalid(`Field "reviewMode" must be one of: ${REVIEW_MODES.join(', ')}.`);
  }

  // 10: code must be a string.
  if (typeof code !== 'string') {
    return invalid('Field "code" must be a string.');
  }

  // 11-12: reject empty or whitespace-only code (without mutating it).
  if (code.trim().length === 0) {
    return invalid('Field "code" must not be empty or whitespace-only.');
  }

  // 13-14: accept up to and including MAX_CODE_LENGTH; reject anything longer.
  if (code.length > MAX_CODE_LENGTH) {
    return tooLarge(`Field "code" must be at most ${MAX_CODE_LENGTH} characters.`);
  }

  // 15: preserve the submitted code exactly.
  return { success: true, data: { language, reviewMode, code } };
}
