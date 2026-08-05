import { tailorTopGradeLegacy, type TopGradeTailoredPayload } from './top-grade';
import { tailorWithNim } from './nim';
import { tailorWithGroq } from './groq';
import type { TailorInput } from './legacy';

export type { TailorInput, TopGradeTailoredPayload };
export type TailoredResumePayload = TopGradeTailoredPayload;

export type TailorBackend = 'legacy' | 'nim' | 'groq';

/**
 * Dispatcher for the top-grade AI resume tailor engine.
 * Prioritizes Groq LPU when `GROQ_API_KEY` or `ANALYZER_BACKEND=groq` is set,
 * falling back automatically to NIM and legacy top-grade tailor.
 */
export async function tailor(input: TailorInput): Promise<TopGradeTailoredPayload> {
    const raw = (process.env.ANALYZER_BACKEND ?? '').toLowerCase();
    const hasGroq = Boolean(process.env.GROQ_API_KEY) || raw === 'groq';
    const hasNim = Boolean(process.env.NVIDIA_NIM_API_KEY) || raw === 'nim';

    // 1. Try Groq LPU (sub-second fast inference)
    if (hasGroq) {
        try {
            return await tailorWithGroq(input);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('GUARDRAIL_BLOCKED')) {
                return tailorTopGradeLegacy(input);
            }
            console.warn('[tailor] groq failed, falling back:', msg);
        }
    }

    // 2. Try NVIDIA NIM
    if (hasNim) {
        try {
            return await tailorWithNim(input);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('GUARDRAIL_BLOCKED')) {
                return tailorTopGradeLegacy(input);
            }
            console.warn('[tailor] nim failed, falling back to legacy top-grade tailor:', msg);
        }
    }

    // 3. Rule-based top-grade fallback
    return tailorTopGradeLegacy(input);
}

export { tailorTopGradeLegacy, tailorWithNim, tailorWithGroq };
