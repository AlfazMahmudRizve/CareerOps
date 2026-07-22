import { NextRequest } from "next/server";
import { nim } from "@/lib/nim";
import { SYSTEM_PROMPT, sanitizeOutput, detectInjection } from "@/lib/guardrail";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/rewrite
 *
 * Body: `{ resumeText?: string, jdText?: string, bullet: string }`
 *
 * Streams 3 ATS-optimized rewrites of a single resume bullet. Uses
 * the NIM client with `response_format: json_object`.
 *
 * Guardrail contract:
 *   - System prompt defines the persona and hard rules.
 *   - The bullet must look like a resume bullet (10-500 chars, vocab check).
 *   - If a prompt-injection pattern is detected, returns the canned
 *     out-of-scope JSON response.
 *   - On any NIM error, emits a single `error` event and closes.
 *
 * Per-IP rate limit: 30 requests / 60 seconds.
 */

const MAX_OPTIONAL_LEN = 20_000;
const MIN_BULLET_LEN = 10;
const MAX_BULLET_LEN = 500;

/** Lightweight bullet-vocab check. A real bullet usually contains one of these. */
const BULLET_VOCAB: ReadonlySet<string> = new Set([
    "led", "managed", "built", "designed", "developed", "implemented",
    "created", "delivered", "shipped", "launched", "owned", "drove",
    "improved", "reduced", "increased", "optimized", "automated",
    "engineer", "developer", "designer", "manager", "analyst", "lead",
    "team", "product", "feature", "system", "service", "api", "app",
    "project", "platform", "pipeline", "infrastructure", "data",
]);

function clientIp(req: NextRequest): string {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
        const first = fwd.split(",")[0]?.trim();
        if (first) return first;
    }
    return req.headers.get("x-real-ip")?.trim() || "unknown";
}

type RewriteBody = {
    resumeText?: unknown;
    jdText?: unknown;
    bullet?: unknown;
};

function isNonEmptyString(v: unknown, max: number): v is string {
    return typeof v === "string" && v.length > 0 && v.length <= max;
}

function isValidBody(
    value: unknown,
): value is { resumeText?: string; jdText?: string; bullet: string } {
    if (!value || typeof value !== "object") return false;
    const v = value as RewriteBody;
    if (typeof v.bullet !== "string") return false;
    if (v.bullet.trim().length < MIN_BULLET_LEN) return false;
    if (v.bullet.length > MAX_BULLET_LEN) return false;
    if (v.resumeText !== undefined && !isNonEmptyString(v.resumeText, MAX_OPTIONAL_LEN)) return false;
    if (v.jdText !== undefined && !isNonEmptyString(v.jdText, MAX_OPTIONAL_LEN)) return false;
    return true;
}

/** Quick bullet-vocab score — at least 1 hit, no injection patterns. */
function looksLikeBullet(s: string): boolean {
    if (detectInjection(s)) return false;
    const norm = s.toLowerCase().replace(/[^a-z\s]/g, " ");
    const tokens = norm.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
        if (BULLET_VOCAB.has(t)) return true;
    }
    return false;
}

/** Encode an SSE event payload. */
function sse(payload: Record<string, unknown>): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: NextRequest) {
    const ip = clientIp(req);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
        const retryAfter = limit.retryAfterSec ?? 1;
        return new Response(JSON.stringify({ error: "rate limited" }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
            },
        });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "invalid input" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!isValidBody(body)) {
        return new Response(JSON.stringify({ error: "invalid input" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!looksLikeBullet(body.bullet)) {
        return new Response(
            JSON.stringify({ error: "I can only rewrite resume bullets." }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    }

    const userPrompt =
        `Rewrite the following resume bullet into 3 ATS-optimized variants.\n` +
        `Each rewrite must:\n` +
        `- start with a strong action verb,\n` +
        `- include at least one quantified metric (numbers, %, $, time saved, etc.) — if the original has no metric, infer a reasonable placeholder like "improved X by 30%" only when contextually defensible,\n` +
        `- include at least one keyword from the job description if provided.\n\n` +
        `Bullet to rewrite:\n"""${body.bullet}"""\n\n` +
        (body.jdText ? `Job description (for keyword extraction):\n"""${body.jdText.slice(0, 4000)}"""\n\n` : "") +
        `Topic constraint: rewrite ONLY a resume bullet. If the input is not a resume bullet, respond with EXACTLY: {"out_of_scope": true}.\n\n` +
        `Respond with strict JSON only. Schema: a JSON array of exactly 3 strings. No prose, no markdown.`;

    const systemPrompt =
        SYSTEM_PROMPT +
        "\n\n" +
        "You rewrite resume bullets for ATS scoring. You MUST respond with valid JSON only. " +
        "Output a single JSON array of exactly 3 rewritten bullet strings. " +
        "Do not include commentary outside JSON.";

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let accumulated = "";
            try {
                const inner = await nim.streamChat(
                    [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    { maxTokens: 512, temperature: 0.4 },
                );
                const reader = inner.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    accumulated += chunk;
                }

                let parsed: unknown;
                try {
                    parsed = JSON.parse(accumulated);
                } catch {
                    controller.enqueue(sse({ error: "invalid rewrite output" }));
                    controller.close();
                    return;
                }

                if (
                    parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed) &&
                    (parsed as Record<string, unknown>).out_of_scope === true
                ) {
                    controller.enqueue(
                        sse({ chunk: "I can only rewrite resume bullets." }),
                    );
                    controller.enqueue(sse({ done: true }));
                    controller.close();
                    return;
                }

                const sanitized = sanitizeOutput(parsed, "rewrite");
                if (!sanitized || !Array.isArray(sanitized)) {
                    controller.enqueue(sse({ error: "invalid rewrite output" }));
                    controller.close();
                    return;
                }

                controller.enqueue(sse({ chunk: JSON.stringify(sanitized) }));
                controller.enqueue(sse({ done: true }));
                controller.close();
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("[api/rewrite] nim failed", err);
                controller.enqueue(sse({ error: "rewrite failed" }));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
