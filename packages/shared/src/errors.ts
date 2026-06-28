/**
 * Provider-neutral error contract for the `generate-review` API (docs §12).
 *
 * Every failure returns the same {@link ReviewApiError} shape so the client has
 * a single error-handling path. The metadata below maps each code to its HTTP
 * status and whether a retry could succeed. Safe, client-facing default
 * messages are kept in a separate map and deliberately contain no provider
 * internals, stack traces, or secrets.
 */

/** The closed set of error codes the API can return. */
export type ReviewApiErrorCode =
  | 'METHOD_NOT_ALLOWED'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'GENERATION_IN_PROGRESS'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_PROVIDER_RESPONSE'
  | 'INTERNAL_ERROR';

/** The error body shape returned to the client (docs §12). */
export type ReviewApiError = {
  error: {
    /** A machine-readable code from {@link ReviewApiErrorCode}. */
    code: ReviewApiErrorCode;
    /** Safe, human-readable message — never secrets or provider payloads. */
    message: string;
    /** Correlates with server logs. */
    requestId: string;
    /** Whether the client may retry the same request. */
    retryable: boolean;
  };
};

/** Transport-level metadata for an error code. */
export type ReviewApiErrorMetadata = {
  /** HTTP status the endpoint responds with. */
  status: number;
  /** Whether a retry of the identical request could succeed. */
  retryable: boolean;
};

/**
 * Read-only mapping of every error code to its HTTP status and retryability.
 * Mirrors the code -> HTTP status table in docs §12.
 */
export const REVIEW_API_ERROR_METADATA: Readonly<
  Record<ReviewApiErrorCode, ReviewApiErrorMetadata>
> = {
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

/**
 * Safe, generic client-facing messages for each error code. These never embed
 * provider errors, stack traces, or secrets — those stay in server logs only.
 */
export const REVIEW_API_ERROR_MESSAGES: Readonly<Record<ReviewApiErrorCode, string>> = {
  INVALID_REQUEST: 'The request was invalid. Check the language, review mode, and code.',
  UNAUTHORIZED: 'You must be signed in to request a review.',
  METHOD_NOT_ALLOWED: 'This endpoint only accepts POST requests.',
  PAYLOAD_TOO_LARGE: 'The submitted code is too large.',
  RATE_LIMITED: 'Too many review requests. Please wait a moment and try again.',
  GENERATION_IN_PROGRESS: 'A review is already being generated. Please wait for it to finish.',
  PROVIDER_UNAVAILABLE: 'The review service is temporarily unavailable. Please try again.',
  INVALID_PROVIDER_RESPONSE: 'The review service returned an unexpected result. Please try again.',
  PROVIDER_TIMEOUT: 'The review took too long to generate. Please try again.',
  INTERNAL_ERROR: 'Something went wrong while generating the review.',
};
