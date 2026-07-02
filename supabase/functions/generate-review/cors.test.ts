/**
 * Tests for the CORS allowlist and browser `OPTIONS` preflight (docs §14).
 *
 * The preflight is the layer that actually controls the `OPTIONS` response, so it
 * is tested directly here. These assert that development origins are included only
 * when the caller opts in (local development) and excluded otherwise (hosted
 * Supabase), that explicit production origins apply in either mode, that allowed
 * origins are reflected while disallowed and native (no-Origin) callers receive no
 * permissive CORS headers, and that there is never a wildcard.
 */

import { assert, assertEquals, assertFalse } from '@std/assert';

import { buildCorsHeaders, getAllowedOrigins, preflightResponse } from './cors.ts';

const PROD_ORIGINS = 'https://app.example.com, https://www.example.com ';

Deno.test('getAllowedOrigins includes development origins when the flag is true', () => {
  const origins = getAllowedOrigins(undefined, true);
  assert(origins.has('http://127.0.0.1:3000'));
  assert(origins.has('http://localhost:8081'));
  assertFalse(origins.has('*'));
});

Deno.test('getAllowedOrigins excludes development origins when the flag is false', () => {
  const origins = getAllowedOrigins(undefined, false);
  // Hosted execution: no localhost/127.0.0.1, and certainly no wildcard.
  assertEquals(origins.size, 0);
  assertFalse(origins.has('http://127.0.0.1:3000'));
  assertFalse(origins.has('http://localhost:8081'));
  assertFalse(origins.has('*'));
});

Deno.test('getAllowedOrigins includes explicit additional origins in either mode', () => {
  const dev = getAllowedOrigins(PROD_ORIGINS, true);
  assert(dev.has('https://app.example.com'));
  assert(dev.has('https://www.example.com')); // trimmed
  assert(dev.has('http://localhost:8081')); // dev origins also present

  const hosted = getAllowedOrigins(PROD_ORIGINS, false);
  assert(hosted.has('https://app.example.com'));
  assert(hosted.has('https://www.example.com'));
  assertFalse(hosted.has('http://localhost:8081')); // but no dev origins
});

Deno.test('getAllowedOrigins never produces a wildcard', () => {
  for (
    const origins of [
      getAllowedOrigins(undefined, true),
      getAllowedOrigins(undefined, false),
      getAllowedOrigins(PROD_ORIGINS, true),
      getAllowedOrigins(PROD_ORIGINS, false),
    ]
  ) {
    assertFalse(origins.has('*'));
  }
});

Deno.test('preflight from an allowed origin returns 204 with reflected CORS headers', () => {
  const res = preflightResponse('http://localhost:8081', getAllowedOrigins(undefined, true));

  assertEquals(res.status, 204);
  assertEquals(res.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  assertEquals(res.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
  assert(res.headers.get('access-control-allow-headers')?.includes('authorization'));
  assertEquals(res.headers.get('vary'), 'Origin');
});

Deno.test('preflight from a disallowed origin returns 204 with no CORS allow headers', () => {
  const res = preflightResponse('https://evil.example.com', getAllowedOrigins(undefined, true));

  assertEquals(res.status, 204);
  assertEquals(res.headers.get('access-control-allow-origin'), null);
  assertEquals(res.headers.get('access-control-allow-methods'), null);
});

Deno.test('preflight from a native client (no Origin) returns 204 with no CORS allow headers', () => {
  const res = preflightResponse(null, getAllowedOrigins(undefined, true));

  assertEquals(res.status, 204);
  assertEquals(res.headers.get('access-control-allow-origin'), null);
});

Deno.test('a dev origin is rejected once development origins are excluded', () => {
  // The same localhost origin that is allowed locally gets no CORS headers in
  // hosted mode, proving the flag actually gates browser access.
  const res = preflightResponse('http://localhost:8081', getAllowedOrigins(undefined, false));

  assertEquals(res.status, 204);
  assertEquals(res.headers.get('access-control-allow-origin'), null);
});

Deno.test('buildCorsHeaders reflects only allowed origins and never wildcards', () => {
  const allowed = getAllowedOrigins(undefined, true);
  assertEquals(
    buildCorsHeaders('http://localhost:8081', allowed)['access-control-allow-origin'],
    'http://localhost:8081',
  );
  assertEquals(
    buildCorsHeaders('https://evil.example.com', allowed)['access-control-allow-origin'],
    undefined,
  );
  assertEquals(buildCorsHeaders(null, allowed)['access-control-allow-origin'], undefined);
});
