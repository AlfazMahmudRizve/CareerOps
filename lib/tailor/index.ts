import { tailorTopGradeLegacy, type TopGradeTailoredPayload } from './top-grade';
import { tailorWithNim } from './nim';
import type { TailorInput } from './legacy';

export type { TailorInput, TopGradeTailoredPayload };
export type TailoredResumePayload = TopGradeTailoredPayload;

export type TailorBackend = 'legacy' | 'nim';

const DEFAULT_BACKEND: TailorBackend = 'legacy';

/**
 * Dispatcher for the top-grade AI resume tailor engine.
 * Calls tailorWithNim when `ANALYZER_BACKEND=nim`, falling back automatically
 * to `tailorTopGradeLegacy` if NIM is unreachable, times out, or fails schema validation.
 */
export async function tailor(input: TailorInput): Promise<TopGradeTailoredPayload> {
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
                // Fall back to rule-based multi-section parsing on guardrail block
                return tailorTopGradeLegacy(input);
            }
            // eslint-disable-next-line no-console
            console.warn('[tailor] nim failed, falling back to legacy top-grade tailor:', msg);
            return tailorTopGradeLegacy(input);
        }
    }

    return tailorTopGradeLegacy(input);
}

export { tailorTopGradeLegacy, tailorWithNim };
