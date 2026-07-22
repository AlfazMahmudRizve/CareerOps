import { nim } from '../nim';
import {
    SYSTEM_PROMPT,
    assessInput,
    sanitizeOutput,
    type GuardrailVerdict,
} from '../guardrail';
import type { AnalyzerResult } from './index';

/**
 * NIM-backed resume/JD analyzer.
 *
 * Performs a two-stage LLM pipeline against an OpenAI-compatible NVIDIA
 * NIM chat endpoint (see `lib/nim.ts`):
 *
 *   1. `extractKeywords(jd)`  — ask the model for a normalized keyword list
 *                                drawn from the job description.
 *   2. `scoreAndAdvise(resume, jd, jdKeywords)` — given those keywords,
 *                                produce the final score + advice object.
 *
 * The final payload is validated against a strict schema with a small
 * hand-written validator (no zod dependency) and the input is truncated
 * to 4000 characters per side to keep prompts well within model limits.
 *
 * Configuration:
 *   - temperature:   0.2
 *   - top_p:         0.7
 *   - max_tokens:    1024
 *   - response_format: always json_object (handled by nim.chat)
 */

export type NimInput = {
    resumeText: string;
    jdText: string;
};

/**
 * Extended analyzer result. The NIM backend additionally provides
 * rewrite bullets the user can paste directly into their resume.
 */
export type NimResult = AnalyzerResult & {
    /** Short, ATS-friendly rewrites the candidate can paste into their resume. */
    rewriteBullets: string[];
};

const MAX_INPUT_CHARS = 4000;
const MAX_FEEDBACK_CHARS = 400;
const MAX_FIX_CHARS = 400;
const MAX_BULLET_CHARS = 200;

/** Truncate a string to at most `n` characters. */
function truncate(text: string, n: number): string {
    if (!text) return '';
    return text.length > n ? text.slice(0, n) : text;
}

/** A schema validator that narrows `unknown` to a typed shape. */
function validateSchema(value: unknown): NimResult | null {
    if (!value || typeof value !== 'object') return null;
    const v = value as Record<string, unknown>;

    // matchScore: integer 0-100
    if (
        typeof v.matchScore !== 'number' ||
        !Number.isFinite(v.matchScore) ||
        !Number.isInteger(v.matchScore) ||
        v.matchScore < 0 ||
        v.matchScore > 100
    ) {
        return null;
    }

    // matchedKeywords / missingKeywords: string[]
    if (
        !Array.isArray(v.matchedKeywords) ||
        !v.matchedKeywords.every((x) => typeof x === 'string')
    ) {
        return null;
    }
    if (
        !Array.isArray(v.missingKeywords) ||
        !v.missingKeywords.every((x) => typeof x === 'string')
    ) {
        return null;
    }

    // feedback / fix: strings <= 400 chars
    if (typeof v.feedback !== 'string' || v.feedback.length > MAX_FEEDBACK_CHARS) {
        return null;
    }
    if (typeof v.fix !== 'string' || v.fix.length > MAX_FIX_CHARS) {
        return null;
    }

    // rewriteBullets: string[] <= 200 chars each
    if (
        !Array.isArray(v.rewriteBullets) ||
        !v.rewriteBullets.every(
            (x) => typeof x === 'string' && x.length <= MAX_BULLET_CHARS,
        )
    ) {
        return null;
    }

    return {
        matchScore: v.matchScore,
        matchedKeywords: v.matchedKeywords as string[],
        missingKeywords: v.missingKeywords as string[],
        feedback: v.feedback,
        fix: v.fix,
        rewriteBullets: v.rewriteBullets as string[],
    };
}

/**
 * Stage 1: ask the model for a normalized keyword list from the JD.
 * Returns the raw model JSON; throws if it isn't an array of strings.
 */
async function extractKeywords(jdText: string): Promise<string[]> {
    const userPrompt =
        `Extract the most important hard-skill and responsibility keywords ` +
        `from this job description. Limit to at most 50 keywords.\n\n` +
        `JOB DESCRIPTION:\n"""${jdText}"""`;

    // Guardrail: hard system prompt defines persona + rules.
    const systemPrompt = SYSTEM_PROMPT + '\n\n' +
        'You extract job-description keywords for an ATS scoring system. ' +
        'You MUST respond with valid JSON only. Output a single JSON object ' +
        'with one field: "keywords", a JSON array of normalized lowercase ' +
        'strings (no duplicates, no punctuation, no stop words).';

    const raw = await nim.chat(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        {
            temperature: 0.2,
            topP: 0.7,
            maxTokens: 2048,
        },
    );

    const arr = (raw as { keywords?: unknown }).keywords;
    if (!Array.isArray(arr) || !arr.every((x) => typeof x === 'string')) {
        throw new Error('NIM schema invalid: extractKeywords payload malformed');
    }
    // Normalize: lowercase, trim, dedupe, drop empties.
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of arr as string[]) {
        const k = raw.toLowerCase().trim();
        if (k && !seen.has(k)) {
            seen.add(k);
            out.push(k);
        }
    }
    return out;
}

/**
 * Stage 2: given the JD keywords, ask the model to score the resume and
 * produce feedback, a fix, and rewrite bullets.
 */
async function scoreAndAdvise(
    resumeText: string,
    jdText: string,
    jdKeywords: string[],
): Promise<NimResult> {
    // Guardrail: hard system prompt defines persona + rules.
    const systemPrompt = SYSTEM_PROMPT + '\n\n' +
        'You are an expert ATS resume reviewer. You MUST respond with valid ' +
        'JSON only, conforming exactly to this schema: ' +
        '{"matchScore": integer 0-100, "matchedKeywords": string[], ' +
        '"missingKeywords": string[], "feedback": string (<=400 chars), ' +
        '"fix": string (<=400 chars), "rewriteBullets": string[] (each ' +
        '<=200 chars, max 5 items)}. No prose outside the JSON.';

    const userPrompt =
        `Score the candidate's resume against the job description.\n\n` +
        `JOB DESCRIPTION KEYWORDS (normalized):\n${JSON.stringify(jdKeywords)}\n\n` +
        `JOB DESCRIPTION:\n"""${jdText}"""\n\n` +
        `RESUME:\n"""${resumeText}"""\n\n` +
        `Return the JSON object now.`;

    const raw = await nim.chat(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        {
            temperature: 0.2,
            topP: 0.7,
            maxTokens: 2048,
        },
    );

    const validated = validateSchema(raw);
    if (!validated) {
        throw new Error('NIM schema invalid: scoreAndAdvise payload failed validation');
    }
    return validated;
}

/**
 * Run the full two-stage NIM pipeline.
 *
 * Throws if either stage fails, returns invalid JSON, or violates the
 * declared schema. Callers (see `lib/analyzer/index.ts`) catch and fall
 * back to the legacy backend.
 */
export async function analyzeWithNim(input: NimInput): Promise<NimResult> {
    // Guardrail layer: validate topic, sanitize, reject injections.
    const verdict: GuardrailVerdict = assessInput({
        resumeText: input.resumeText ?? '',
        jdText: input.jdText ?? '',
    });
    if (!verdict.allowed || !verdict.sanitized) {
        const reason = verdict.reason ?? 'input not allowed';
        // Tagged error so the dispatcher can distinguish guardrail blocks
        // from generic NIM failures and return the out-of-scope response.
        throw new Error(`GUARDRAIL_BLOCKED: ${reason}`);
    }

    const resumeText = truncate(verdict.sanitized.resumeText, MAX_INPUT_CHARS);
    const jdText = truncate(verdict.sanitized.jdText, MAX_INPUT_CHARS);

    const jdKeywords = await extractKeywords(jdText);
    const raw = await scoreAndAdvise(resumeText, jdText, jdKeywords);

    // Belt-and-braces: also run schema sanitizer in case the model drifts.
    const cleaned = sanitizeOutput(raw, 'analyze') as NimResult | null;
    if (!cleaned) {
        throw new Error('NIM schema invalid: sanitizer rejected payload');
    }
    return cleaned;
}
