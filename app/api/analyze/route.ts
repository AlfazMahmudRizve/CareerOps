import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/analyzer";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/analyze
 *
 * Body: `{ resumeText: string, jdText: string }`
 *
 * Runs the configured analyzer backend (legacy keyword match by default,
 * or the NIM-backed LLM pipeline when `ANALYZER_BACKEND=nim`) against the
 * provided resume and job description, returning an ATS-style score plus
 * matched/missing keywords and actionable feedback.
 *
 * Per-IP rate limit: 30 requests / 60 seconds (see `lib/ratelimit.ts`).
 * When exceeded, returns 429 with a `Retry-After` header in seconds.
 */

const MAX_FIELD_LEN = 20_000;

/**
 * Extract a best-effort client IP from common proxy headers, falling
 * back to the literal string `"unknown"` so all callers share one bucket
 * rather than bypassing the limiter.
 */
function clientIp(req: NextRequest): string {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
        // x-forwarded-for can be a comma-separated chain; first hop is the client.
        const first = fwd.split(",")[0]?.trim();
        if (first) return first;
    }
    return req.headers.get("x-real-ip")?.trim() || "unknown";
}

type AnalyzeBody = {
    resumeText?: unknown;
    jdText?: unknown;
};

function isValidBody(value: unknown): value is { resumeText: string; jdText: string } {
    if (!value || typeof value !== "object") return false;
    const v = value as AnalyzeBody;
    return (
        typeof v.resumeText === "string" &&
        typeof v.jdText === "string" &&
        v.resumeText.length > 0 &&
        v.resumeText.length <= MAX_FIELD_LEN &&
        v.jdText.length > 0 &&
        v.jdText.length <= MAX_FIELD_LEN
    );
}

export async function POST(req: NextRequest) {
    // 1. Rate limit first so we don't waste cycles parsing abusive traffic.
    const ip = clientIp(req);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
        const retryAfter = limit.retryAfterSec ?? 1;
        return NextResponse.json(
            { error: "rate limited" },
            { status: 429, headers: { "Retry-After": String(retryAfter) } },
        );
    }

    // 2. Validate input.
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    if (!isValidBody(body)) {
        return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    const { resumeText, jdText } = body;

    // 3. Run the analyzer and return its result verbatim.
    try {
        const result = await analyze({ resumeText, jdText });
        return NextResponse.json(result);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[api/analyze] analyze failed", err);
        return NextResponse.json({ error: "analyze failed" }, { status: 500 });
    }
}
