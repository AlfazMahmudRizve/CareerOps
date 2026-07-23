import { NextRequest, NextResponse } from 'next/server';
import { tailor } from '@/lib/tailor';
import { checkRateLimit } from '@/lib/ratelimit';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const MAX_FIELD_LEN = 20_000;

/**
 * Extract client IP for per-IP rate limiting.
 */
function clientIp(req: NextRequest): string {
    const fwd = req.headers.get('x-forwarded-for');
    if (fwd) {
        const first = fwd.split(',')[0]?.trim();
        if (first) return first;
    }
    return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

type TailorBody = {
    resumeText?: unknown;
    jdText?: unknown;
    missingKeywords?: unknown;
};

function isValidBody(value: unknown): value is { resumeText: string; jdText: string; missingKeywords?: string[] } {
    if (!value || typeof value !== 'object') return false;
    const v = value as TailorBody;
    const basicValid = (
        typeof v.resumeText === 'string' &&
        typeof v.jdText === 'string' &&
        v.resumeText.length > 0 &&
        v.resumeText.length <= MAX_FIELD_LEN &&
        v.jdText.length > 0 &&
        v.jdText.length <= MAX_FIELD_LEN
    );

    if (!basicValid) return false;

    if (v.missingKeywords !== undefined && v.missingKeywords !== null) {
        if (!Array.isArray(v.missingKeywords) || !v.missingKeywords.every((k) => typeof k === 'string')) {
            return false;
        }
    }

    return true;
}

/**
 * POST /api/tailor
 *
 * Tailors a candidate resume against a job description to generate an ATS-aligned payload.
 */
export async function POST(req: NextRequest) {
    // 1. Per-IP rate limit check
    const ip = clientIp(req);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
        const retryAfter = limit.retryAfterSec ?? 1;
        return NextResponse.json(
            { error: 'rate limited' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } },
        );
    }

    // 2. Validate request payload
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    if (!isValidBody(body)) {
        return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    const { resumeText, jdText, missingKeywords } = body;

    // 3. Dispatch to tailor engine
    try {
        const result = await tailor({ resumeText, jdText, missingKeywords });
        return NextResponse.json(result);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api/tailor] tailor failed:', err);
        return NextResponse.json({ error: 'tailor failed' }, { status: 500 });
    }
}
