import { tailorLegacy, type TailorInput, type TailoredResumePayload } from './legacy';
import { tailorWithNim } from './nim';

export type { TailorInput, TailoredResumePayload };

export type TailorBackend = 'legacy' | 'nim';

const DEFAULT_BACKEND: TailorBackend = 'legacy';

/**
 * Dispatcher for the resume tailor engine.
 * Calls tailorWithNim when `ANALYZER_BACKEND=nim`, falling back automatically
 * to `tailorLegacy` if NIM is unreachable, times out, or fails schema validation.
 */
export async function tailor(input: TailorInput): Promise<TailoredResumePayload> {
    const raw = (process.env.ANALYZER_BACKEND ?? DEFAULT_BACKEND).toLowerCase();
    const backend: TailorBackend = raw === 'nim' ? 'nim' : 'legacy';

    if (backend === 'nim') {
        try {
            return await tailorWithNim(input);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('GUARDRAIL_BLOCKED')) {
                // eslint-disable-next-line no-console
                console.warn('[tailor] guardrail blocked input:', msg);
                // Fall back to legacy rule-based parsing on guardrail block
                return tailorLegacy(input);
            }
            // eslint-disable-next-line no-console
            console.warn('[tailor] nim failed, falling back to legacy:', msg);
            return tailorLegacy(input);
        }
    }

    return tailorLegacy(input);
}
