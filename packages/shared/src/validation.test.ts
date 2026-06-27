/**
 * Validation tests for the review API request contract.
 *
 * Run with Node's built-in test runner (`node --test`); no external framework,
 * Supabase, AI provider, or network service is involved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_CODE_LENGTH, REVIEW_LANGUAGES, REVIEW_MODES } from './constants.ts';
import { validateGenerateReviewRequest } from './validation.ts';

/** A known-good request used as the base for valid-case assertions. */
function baseRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    language: 'python',
    reviewMode: 'find_bugs',
    code: 'def average(nums):\n    return sum(nums) / len(nums)\n',
    ...overrides,
  };
}

test('accepts a complete, valid request and preserves it exactly', () => {
  const input = baseRequest();
  const result = validateGenerateReviewRequest(input);

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data, {
      language: 'python',
      reviewMode: 'find_bugs',
      code: 'def average(nums):\n    return sum(nums) / len(nums)\n',
    });
  }
});

test('accepts every supported language', () => {
  for (const language of REVIEW_LANGUAGES) {
    const result = validateGenerateReviewRequest(baseRequest({ language }));
    assert.equal(result.success, true, `expected ${language} to be valid`);
    if (result.success) {
      assert.equal(result.data.language, language);
    }
  }
});

test('accepts every supported review mode', () => {
  for (const reviewMode of REVIEW_MODES) {
    const result = validateGenerateReviewRequest(baseRequest({ reviewMode }));
    assert.equal(result.success, true, `expected ${reviewMode} to be valid`);
    if (result.success) {
      assert.equal(result.data.reviewMode, reviewMode);
    }
  }
});

test('preserves meaningful code whitespace verbatim', () => {
  // Leading, trailing, and internal whitespace must survive untouched.
  const code = '   \n\tif (x):\n        return x   \n\n';
  const result = validateGenerateReviewRequest(baseRequest({ code }));

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.code, code);
  }
});

test('accepts code of exactly MAX_CODE_LENGTH characters', () => {
  const code = 'a'.repeat(MAX_CODE_LENGTH);
  const result = validateGenerateReviewRequest(baseRequest({ code }));

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.code.length, MAX_CODE_LENGTH);
  }
});

test('rejects code of MAX_CODE_LENGTH + 1 characters as PAYLOAD_TOO_LARGE', () => {
  const code = 'a'.repeat(MAX_CODE_LENGTH + 1);
  const result = validateGenerateReviewRequest(baseRequest({ code }));

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'PAYLOAD_TOO_LARGE');
  }
});

test('rejects null', () => {
  const result = validateGenerateReviewRequest(null);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects arrays', () => {
  for (const value of [[], [baseRequest()], ['language', 'reviewMode', 'code']]) {
    const result = validateGenerateReviewRequest(value);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects primitive values', () => {
  const primitives: unknown[] = ['a string', 42, true, false, undefined, 0n, Symbol('x')];
  for (const value of primitives) {
    const result = validateGenerateReviewRequest(value);
    assert.equal(result.success, false, `expected ${String(value)} to be rejected`);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects a missing language', () => {
  const input = baseRequest();
  delete input.language;
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects a missing review mode', () => {
  const input = baseRequest();
  delete input.reviewMode;
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects a missing code field', () => {
  const input = baseRequest();
  delete input.code;
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects an invalid language', () => {
  for (const language of ['Python', 'go', 'javascript', '', 'PYTHON']) {
    const result = validateGenerateReviewRequest(baseRequest({ language }));
    assert.equal(result.success, false, `expected ${language} to be rejected`);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects an invalid review mode', () => {
  for (const reviewMode of ['findBugs', 'debug', 'explain', '', 'FIND_BUGS']) {
    const result = validateGenerateReviewRequest(baseRequest({ reviewMode }));
    assert.equal(result.success, false, `expected ${reviewMode} to be rejected`);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects non-string code', () => {
  for (const code of [42, true, null, {}, ['x'], undefined]) {
    const result = validateGenerateReviewRequest(baseRequest({ code }));
    assert.equal(result.success, false, `expected ${String(code)} to be rejected`);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects empty-string code', () => {
  const result = validateGenerateReviewRequest(baseRequest({ code: '' }));
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects whitespace-only code', () => {
  for (const code of ['   ', '\n\n', '\t', ' \n\t \r\n ']) {
    const result = validateGenerateReviewRequest(baseRequest({ code }));
    assert.equal(result.success, false, `expected ${JSON.stringify(code)} to be rejected`);
    if (!result.success) {
      assert.equal(result.error.code, 'INVALID_REQUEST');
    }
  }
});

test('rejects unexpected properties', () => {
  const result = validateGenerateReviewRequest(baseRequest({ extra: 'nope' }));
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects a symbol-keyed extra property', () => {
  const input: Record<PropertyKey, unknown> = {
    language: 'python',
    reviewMode: 'find_bugs',
    code: 'x = 1',
    [Symbol('smuggled')]: 'value',
  };
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects a JSON-parsed object carrying an own __proto__ key', () => {
  // JSON.parse adds "__proto__" as an own enumerable key (it does not pollute
  // the prototype). It must be rejected as an unexpected field.
  const input = JSON.parse(
    '{"language":"python","reviewMode":"find_bugs","code":"x = 1","__proto__":{"isAdmin":true}}',
  );
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects objects with a custom prototype', () => {
  const proto = { injected: true };
  const input = Object.create(proto) as Record<string, unknown>;
  input.language = 'python';
  input.reviewMode = 'find_bugs';
  input.code = 'x = 1';
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects objects with a null prototype', () => {
  const input = Object.create(null) as Record<string, unknown>;
  input.language = 'python';
  input.reviewMode = 'find_bugs';
  input.code = 'x = 1';
  const result = validateGenerateReviewRequest(input);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('rejects class instances', () => {
  class ReviewRequest {
    language = 'python';
    reviewMode = 'find_bugs';
    code = 'x = 1';
  }
  const result = validateGenerateReviewRequest(new ReviewRequest());
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.code, 'INVALID_REQUEST');
  }
});

test('produces a predictable, typed failure that narrows safely', () => {
  const result = validateGenerateReviewRequest({ language: 'python' });

  // The discriminated union narrows: `data` is unavailable on a failure and
  // `error` is unavailable on a success, enforced by the compiler.
  assert.equal('data' in result, false);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(['INVALID_REQUEST', 'PAYLOAD_TOO_LARGE'].includes(result.error.code));
    assert.equal(typeof result.error.message, 'string');
    assert.ok(result.error.message.length > 0);
  }
});

test('does not mutate the input object', () => {
  const input = baseRequest();
  const snapshot = { ...input };
  validateGenerateReviewRequest(input);
  assert.deepEqual(input, snapshot);
});
