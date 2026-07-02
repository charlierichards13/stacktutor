/**
 * CORS policy for the `generate-review` function (docs/AI_REVIEW_BACKEND.md §14).
 *
 * Auth — not CORS — is the security boundary (§3). CORS here only governs which
 * *browser* origins may read responses:
 *
 *   - Native clients (Expo / React Native) send no `Origin` header and are not
 *     subject to browser CORS; they are never blocked here.
 *   - Browser origins must be on an explicit allowlist. The local development
 *     origins are included ONLY during local development (the caller passes the
 *     flag); hosted Supabase execution excludes them. Production origins are
 *     supplied at deploy time via the `ADDITIONAL_ALLOWED_ORIGINS` env var, so no
 *     production domain is invented or committed and there is never a wildcard.
 *   - A disallowed browser origin receives NO `Access-Control-Allow-Origin`
 *     header, so the browser refuses the response.
 */

/**
 * Local development origins that may call the function from a browser. These
 * mirror the dev URLs already present in `supabase/config.toml` (`site_url` /
 * `additional_redirect_urls`) plus the default Expo web dev server port.
 */
const DEV_ALLOWED_ORIGINS: readonly string[] = [
  'http://127.0.0.1:3000',
  'https://127.0.0.1:3000',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];

/** Request headers the browser is allowed to send on the actual request. */
const ALLOWED_REQUEST_HEADERS = 'authorization, x-client-info, apikey, content-type';

/** Methods the endpoint supports for browser clients. */
const ALLOWED_METHODS = 'POST, OPTIONS';

/** How long a browser may cache the preflight result, in seconds. */
const PREFLIGHT_MAX_AGE = '86400';

/**
 * Builds the set of allowed browser origins.
 *
 * - `additionalOrigins`: a comma-separated list (from `ADDITIONAL_ALLOWED_ORIGINS`)
 *   of explicit production web origins, configured at deploy time — never
 *   committed. Blank entries are ignored. Included in every mode.
 * - `includeDevelopmentOrigins`: when `true` (local development), the hard-coded
 *   {@link DEV_ALLOWED_ORIGINS} are added; when `false` (hosted Supabase), they
 *   are excluded so localhost/127.0.0.1 are never trusted in production.
 *
 * The behavior is explicit: the caller decides whether development origins apply.
 * No wildcard is ever produced.
 */
export function getAllowedOrigins(
  additionalOrigins: string | undefined,
  includeDevelopmentOrigins: boolean,
): ReadonlySet<string> {
  const extra = (additionalOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const base = includeDevelopmentOrigins ? DEV_ALLOWED_ORIGINS : [];
  return new Set<string>([...base, ...extra]);
}

/**
 * CORS headers to attach to an actual (non-preflight) response. When the caller
 * is a browser on an allowed origin, the origin is reflected and `Vary: Origin`
 * is set so caches never serve one origin's CORS decision to another. Native
 * clients (no `Origin`) and disallowed origins receive no
 * `Access-Control-Allow-Origin` header.
 */
export function buildCorsHeaders(
  origin: string | null,
  allowedOrigins: ReadonlySet<string>,
): Record<string, string> {
  if (origin !== null && allowedOrigins.has(origin)) {
    return {
      'access-control-allow-origin': origin,
      vary: 'Origin',
    };
  }
  return { vary: 'Origin' };
}

/**
 * Response to a browser `OPTIONS` preflight. Allowed origins get the full set of
 * CORS headers; disallowed origins and native callers get a bare `204` with no
 * permissive CORS headers. Preflight is answered before authentication because a
 * preflight request carries no `Authorization` header.
 */
export function preflightResponse(
  origin: string | null,
  allowedOrigins: ReadonlySet<string>,
): Response {
  const headers: Record<string, string> = buildCorsHeaders(origin, allowedOrigins);
  if (headers['access-control-allow-origin'] !== undefined) {
    headers['access-control-allow-methods'] = ALLOWED_METHODS;
    headers['access-control-allow-headers'] = ALLOWED_REQUEST_HEADERS;
    headers['access-control-max-age'] = PREFLIGHT_MAX_AGE;
  }
  return new Response(null, { status: 204, headers });
}
