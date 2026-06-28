/**
 * Integration tests for the `generate-review` request handler.
 *
 * These exercise the function's own mapping and integration behavior (CORS/OPTIONS
 * bypass, method, authentication mapping, JSON/body handling, the shared-validator
 * → HTTP mapping, the stubbed success shape, and the safety invariants). They do
 * NOT re-test the shared validator's 28 unit cases — only how this handler maps
 * and integrates them. Everything runs offline with injected dependencies and a
 * mocked authenticator; no Supabase, AI provider, network, or database is contacted.
 *
 * Note on authentication: a genuinely missing or invalid JWT is rejected by the
 * Supabase gateway (`verify_jwt = true`) before this handler runs. When a request
 * does reach the handler, the injected authenticator (backed by `verifyAuth` in
 * production) controls the `UNAUTHORIZED` mapping, tested here with a mock.
 */

import { assert, assertEquals, assertExists, assertFalse } from '@std/assert';
import { MAX_CODE_LENGTH, REVIEW_API_ERROR_MESSAGES } from '@stacktutor/shared';

import type { Caller } from './auth.ts';
import { handleGenerateReview, type HandlerDeps, type ReviewLogEvent } from './handler.ts';

const VALID_CALLER: Caller = { id: 'user-123' };
const ALLOWED_ORIGINS = new Set<string>(['http://localhost:8081']);

function makeDeps(
  overrides: Partial<HandlerDeps> = {},
): { deps: HandlerDeps; logs: ReviewLogEvent[] } {
  const logs: ReviewLogEvent[] = [];
  const deps: HandlerDeps = {
    authenticate: () => Promise.resolve(VALID_CALLER),
    allowedOrigins: ALLOWED_ORIGINS,
    newRequestId: () => 'test-request-id',
    maxRawBodyBytes: 256 * 1024,
    log: (event) => logs.push(event),
    ...overrides,
  };
  return { deps, logs };
}

function postRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/functions/v1/generate-review', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

function validBody(code = 'print(1)\n'): string {
  return JSON.stringify({ language: 'python', reviewMode: 'find_bugs', code });
}

/**
 * A POST request with NO Content-Type header. A `BufferSource` (Uint8Array) body
 * sets no Content-Type, so this models a client that omits the header entirely.
 */
function postWithoutContentType(body: string): Request {
  return new Request('http://localhost/functions/v1/generate-review', {
    method: 'POST',
    body: new TextEncoder().encode(body),
  });
}

Deno.test('OPTIONS preflight is answered before (and bypasses) authentication', async () => {
  let authCalls = 0;
  const { deps } = makeDeps({
    authenticate: () => {
      authCalls++;
      return Promise.resolve(VALID_CALLER);
    },
  });
  const req = new Request('http://localhost/functions/v1/generate-review', {
    method: 'OPTIONS',
    headers: { origin: 'http://localhost:8081' },
  });
  const res = await handleGenerateReview(req, deps);

  assertEquals(res.status, 204);
  assertEquals(res.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  assertEquals(authCalls, 0);
});

Deno.test('rejects a non-POST method with 405 METHOD_NOT_ALLOWED', async () => {
  const { deps } = makeDeps();
  const req = new Request('http://localhost/functions/v1/generate-review', { method: 'GET' });
  const res = await handleGenerateReview(req, deps);

  assertEquals(res.status, 405);
  assertEquals(res.headers.get('allow'), 'POST, OPTIONS');
  const body = await res.json();
  assertEquals(body.error.code, 'METHOD_NOT_ALLOWED');
  assertEquals(body.error.retryable, false);
});

Deno.test('maps an authentication failure to a safe UNAUTHORIZED (no raw detail)', async () => {
  // The production authenticator returns null on any verifyAuth error; the handler
  // never sees the raw error message/status, only the safe shared response.
  const { deps } = makeDeps({ authenticate: () => Promise.resolve(null) });
  const res = await handleGenerateReview(postRequest(validBody()), deps);

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error.code, 'UNAUTHORIZED');
  assertEquals(body.error.message, REVIEW_API_ERROR_MESSAGES.UNAUTHORIZED);
});

Deno.test('rejects malformed JSON with 400 INVALID_REQUEST', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(postRequest('{ not valid json'), deps);

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('rejects an empty body with 400 INVALID_REQUEST', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(postRequest(''), deps);

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('rejects a non-object JSON body with 400 INVALID_REQUEST', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(postRequest('"just a string"'), deps);

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('rejects a missing Content-Type with 400 INVALID_REQUEST', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(postWithoutContentType(validBody()), deps);

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('rejects text/plain carrying valid JSON with 400 INVALID_REQUEST', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(
    postRequest(validBody(), { 'content-type': 'text/plain' }),
    deps,
  );

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('accepts application/json', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(
    postRequest(validBody(), { 'content-type': 'application/json' }),
    deps,
  );

  assertEquals(res.status, 200);
  assertEquals((await res.json()).requestId, 'test-request-id');
});

Deno.test('accepts application/json with a charset parameter', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(
    postRequest(validBody(), { 'content-type': 'application/json; charset=utf-8' }),
    deps,
  );

  assertEquals(res.status, 200);
  assertEquals((await res.json()).requestId, 'test-request-id');
});

Deno.test('maps the shared INVALID_REQUEST failure (bad language) to 400', async () => {
  const { deps } = makeDeps();
  const body = JSON.stringify({ language: 'ruby', reviewMode: 'find_bugs', code: 'x = 1' });
  const res = await handleGenerateReview(postRequest(body), deps);

  assertEquals(res.status, 400);
  assertEquals((await res.json()).error.code, 'INVALID_REQUEST');
});

Deno.test('maps the shared PAYLOAD_TOO_LARGE failure (oversized code) to 413', async () => {
  const { deps } = makeDeps();
  const body = JSON.stringify({
    language: 'python',
    reviewMode: 'find_bugs',
    code: 'a'.repeat(MAX_CODE_LENGTH + 1),
  });
  const res = await handleGenerateReview(postRequest(body), deps);

  assertEquals(res.status, 413);
  assertEquals((await res.json()).error.code, 'PAYLOAD_TOO_LARGE');
});

Deno.test('rejects a raw body over the byte cap with 413 before parsing', async () => {
  // The body is not valid JSON; getting 413 (not 400) proves the size guard runs
  // before any JSON parsing.
  const { deps } = makeDeps({ maxRawBodyBytes: 1024 });
  const res = await handleGenerateReview(postRequest('x'.repeat(2048)), deps);

  assertEquals(res.status, 413);
  assertEquals((await res.json()).error.code, 'PAYLOAD_TOO_LARGE');
});

Deno.test('enforces the raw-body cap on UTF-8 byte length, not code units', async () => {
  // 50 '€' = 50 UTF-16 code units but 150 UTF-8 bytes. With a 100-byte cap, the
  // old code-unit check (50 ≤ 100) would have wrongly passed; the byte length
  // (150 > 100) rejects it before parsing.
  const { deps } = makeDeps({ maxRawBodyBytes: 100 });
  const body = '€'.repeat(50);
  const res = await handleGenerateReview(
    postRequest(body, { 'content-type': 'application/json' }),
    deps,
  );

  assertEquals(res.status, 413);
  assertEquals((await res.json()).error.code, 'PAYLOAD_TOO_LARGE');
});

Deno.test('returns 200 with the complete stubbed response shape', async () => {
  const { deps } = makeDeps();
  const res = await handleGenerateReview(postRequest(validBody()), deps);

  assertEquals(res.status, 200);
  assertEquals(res.headers.get('content-type'), 'application/json; charset=utf-8');

  const body = await res.json();
  assertEquals(body.requestId, 'test-request-id');

  const review = body.review;
  assertExists(review);
  assertEquals(typeof review.summary, 'string');
  assert(Array.isArray(review.findings));
  assert(Array.isArray(review.guidedHints));
  assertEquals(typeof review.explanation, 'string');
  assert(Array.isArray(review.suggestedTests));
  assertEquals(typeof review.complexity.time, 'string');
  assertEquals(typeof review.complexity.space, 'string');
  assertEquals(typeof review.complexity.explanation, 'string');
  assertEquals(typeof review.security.summary, 'string');
  assert(Array.isArray(review.security.findings));
});

Deno.test('uses the injected request-id generator on every response', async () => {
  let n = 0;
  const { deps } = makeDeps({ newRequestId: () => `req-${n++}` });
  const first = await handleGenerateReview(postRequest(validBody()), deps);
  const second = await handleGenerateReview(postRequest(validBody()), deps);

  assertEquals((await first.json()).requestId, 'req-0');
  assertEquals((await second.json()).requestId, 'req-1');
});

Deno.test('error responses carry only the safe contract fields', async () => {
  const { deps } = makeDeps({ authenticate: () => Promise.resolve(null) });
  const res = await handleGenerateReview(postRequest(validBody()), deps);

  const body = await res.json();
  assertEquals(Object.keys(body), ['error']);
  assertEquals(Object.keys(body.error).sort(), ['code', 'message', 'requestId', 'retryable']);
  assertEquals(body.error.requestId, 'test-request-id');
  assertEquals(typeof body.error.message, 'string');
});

Deno.test('never echoes the submitted code in the response', async () => {
  const sentinel = 'SENTINEL_RESPONSE_TOKEN_d34db33f';
  const { deps } = makeDeps();
  const body = JSON.stringify({
    language: 'python',
    reviewMode: 'explain_code',
    code: `print("${sentinel}")`,
  });
  const res = await handleGenerateReview(postRequest(body), deps);

  const text = await res.text();
  assertFalse(text.includes(sentinel));
});

Deno.test('never logs the submitted code; logs only safe metadata', async () => {
  const sentinel = 'SENTINEL_LOG_TOKEN_c0ffee';
  const code = `// ${sentinel}\nclass A {}`;
  const { deps, logs } = makeDeps();
  const body = JSON.stringify({ language: 'java', reviewMode: 'find_bugs', code });
  await handleGenerateReview(postRequest(body), deps);

  assertEquals(logs.length, 1);
  assertFalse(JSON.stringify(logs).includes(sentinel));
  const [event] = logs;
  assertExists(event);
  // Narrow to the success event; the only safe size field is a number, never code.
  if (event.outcome !== 'success') {
    throw new Error(`expected a success log event, got ${event.outcome}`);
  }
  assertEquals(event.codeLength, code.length);
  assertEquals(event.language, 'java');
  assertEquals(event.reviewMode, 'find_bugs');
});

Deno.test('makes no external/provider network request', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = ((..._args: unknown[]): Promise<Response> => {
    fetchCalls++;
    throw new Error('network access is not permitted in this scaffold');
  }) as unknown as typeof fetch;

  try {
    const { deps } = makeDeps();
    const res = await handleGenerateReview(postRequest(validBody()), deps);
    assertEquals(res.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assertEquals(fetchCalls, 0);
});

Deno.test('creates no Supabase, admin, or database client (none is available to the handler)', async () => {
  // The handler's dependencies expose no client of any kind, so neither a database
  // write nor service-role access is possible by construction; the no-network test
  // further proves no I/O occurs.
  const { deps } = makeDeps();
  const record = deps as Record<string, unknown>;
  for (
    const key of ['supabase', 'supabaseAdmin', 'db', 'createContextClient', 'createAdminClient']
  ) {
    assertFalse(key in record, `unexpected client dependency: ${key}`);
  }

  const res = await handleGenerateReview(postRequest(validBody()), deps);
  assertEquals(res.status, 200);
});
