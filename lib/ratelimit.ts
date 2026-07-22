/**
 * In-memory token-bucket rate limiter, keyed by client IP.
 *
 * ────────────────────────────────────────────────────────────────────
 * Algorithm (unit-style reference)
 * ────────────────────────────────────────────────────────────────────
 * State per IP:
 *   tokens       — current available tokens (float, 0..CAP)
 *   lastRefill   — ms timestamp of the last refill calculation
 *
 * On each call to `checkRateLimit(ip)`:
 *   1.  Look up (or create) the bucket for `ip`.
 *   2.  Compute elapsed seconds since `lastRefill`:
 *           delta = (now - lastRefill) / 1000
 *   3.  Add `delta * REFILL_PER_SEC` tokens, capped at CAP:
 *           tokens = min(CAP, tokens + delta * REFILL_PER_SEC)
 *   4.  Update `lastRefill = now`.
 *   5.  If `tokens >= 1`: consume one token and return { allowed: true }.
 *       Otherwise: compute `retryAfterSec = ceil((1 - tokens) / REFILL_PER_SEC)`
 *       and return { allowed: false, retryAfterSec }.
 *
 * Defaults: CAP = 30, WINDOW_SEC = 60, so REFILL_PER_SEC = 30/60 = 0.5
 * tokens/second, i.e. up to 30 requests per minute per IP.
 *
 * ────────────────────────────────────────────────────────────────────
 * Caveats
 * ────────────────────────────────────────────────────────────────────
 *  - State lives in the Node.js process memory only; it resets on
 *    server restart and is NOT shared across multiple instances.
 *    For multi-region / multi-instance deployments swap this for a
 *    Redis-backed limiter.
 *  - This is best-effort abuse mitigation, not a security boundary.
 */

export type RateLimitResult = {
    /** True if the request is allowed (a token was consumed). */
    allowed: boolean;
    /**
     * Seconds the caller should wait before retrying. Only set when
     * `allowed` is false; rounded up to the nearest whole second.
     */
    retryAfterSec?: number;
};

type Bucket = {
    tokens: number;
    lastRefill: number;
};

/** Maximum tokens a bucket can hold. */
const CAP = 30;
/** Refill window in seconds. */
const WINDOW_SEC = 60;
/** Tokens added per second (continuous sliding refill). */
const REFILL_PER_SEC = CAP / WINDOW_SEC; // 0.5

/**
 * Buckets keyed by IP. Module-scoped so it survives between requests
 * within the same Node.js process.
 */
const buckets: Map<string, Bucket> = new Map();

/**
 * Check (and atomically consume) a token for the given IP.
 *
 * @param ip Client identifier (e.g. `x-forwarded-for` value or `"unknown"`).
 * @returns `{ allowed: true }` on success, or `{ allowed: false, retryAfterSec }`
 *          when the caller is being rate-limited.
 */
export function checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const key = ip || "unknown";

    let bucket = buckets.get(key);
    if (!bucket) {
        // Brand-new caller: start with a full bucket so legitimate first
        // visitors aren't penalized for sharing an IP range.
        bucket = { tokens: CAP, lastRefill: now };
        buckets.set(key, bucket);
    } else {
        const deltaSec = (now - bucket.lastRefill) / 1000;
        if (deltaSec > 0) {
            bucket.tokens = Math.min(CAP, bucket.tokens + deltaSec * REFILL_PER_SEC);
            bucket.lastRefill = now;
        }
    }

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return { allowed: true };
    }

    // Not enough tokens — tell the client how long to wait.
    const needed = 1 - bucket.tokens; // amount of tokens we still need
    const retryAfterSec = Math.max(1, Math.ceil(needed / REFILL_PER_SEC));
    return { allowed: false, retryAfterSec };
}
