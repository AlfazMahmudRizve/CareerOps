import { analyzeLegacy, type LegacyInput, type LegacyResult } from './legacy';
import { analyzeWithNim, type NimInput, type NimResult } from './nim';
import { outOfScopeResponse } from '../guardrail';

/**
 * Common analyzer output shape.
 *
 * Both backends (`legacy` and `nim`) return at minimum these fields, so
 * callers can rely on them regardless of which backend ran.
 */
export type AnalyzerResult = {
    /** Integer 0-100 representing the resume↔JD match. */
    matchScore: number;
    /** JD keywords that were found in the resume. */
    matchedKeywords: string[];
    /** JD keywords that were NOT found in the resume. */
    missingKeywords: string[];
    /** Short, human-readable summary paragraph (<= 400 chars for NIM). */
    feedback: string;
    /** Concrete fix suggestion (<= 400 chars for NIM). */
    fix: string;
};

/**
 * Dispatcher input. Both backends accept the same shape.
 */
export type AnalyzeInput = LegacyInput | NimInput;

export type { LegacyResult, NimResult };

/**
 * Selected analyzer backend. Controlled by `process.env.ANALYZER_BACKEND`.
 */
export type AnalyzerBackend = 'legacy' | 'nim';

const DEFAULT_BACKEND: AnalyzerBackend = 'legacy';

/**
 * Run the configured analyzer backend.
 *
 * Guardrail contract: if NIM is enabled and the input is blocked by the
 * guardrail layer (off-topic, prompt-injection, too short, etc.), the
 * dispatcher returns the canned out-of-scope response. For any other
 * NIM failure (network, missing key, schema mismatch, timeout), we log
 * a warning and fall back to the legacy backend so the user-facing API
 * never goes down because of an upstream issue.
 */
export async function analyze(input: AnalyzeInput): Promise<AnalyzerResult> {
    const raw = (process.env.ANALYZER_BACKEND ?? DEFAULT_BACKEND).toLowerCase();
    const backend: AnalyzerBackend = raw === 'nim' ? 'nim' : 'legacy';

    if (backend === 'nim') {
        try {
            const result = await analyzeWithNim(input);
            return result;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('GUARDRAIL_BLOCKED')) {
                // Guardrail rejected the input — don't fall back to legacy,
                // just return the canned out-of-scope response.
                // eslint-disable-next-line no-console
                console.warn('[analyzer] guardrail blocked input:', msg);
                return outOfScopeResponse();
            }
            // eslint-disable-next-line no-console
            console.warn('[analyzer] nim failed, falling back to legacy:', msg);
            return analyzeLegacy(input);
        }
    }

    return analyzeLegacy(input);
}
