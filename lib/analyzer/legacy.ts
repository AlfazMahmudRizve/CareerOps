import nlp from 'compromise';
import type { AnalyzerResult } from './index';

/**
 * Legacy keyword-based resume/JD analyzer.
 *
 * This logic was extracted verbatim from `app/api/analyze/route.ts` and
 * preserves the original behavior (compromise-based keyword extraction,
 * fuzzy matching, +15 heuristic bump, feedback/fix string assembly).
 *
 * It is intentionally side-effect free: no network calls, no API keys.
 * The async signature mirrors `analyzeWithNim` so callers can swap
 * backends via the dispatcher without changing call sites.
 */
export type LegacyInput = {
    resumeText: string;
    jdText: string;
};

/**
 * Result shape returned by the legacy analyzer. Matches the fields
 * previously emitted from `app/api/analyze/route.ts` that the frontend
 * actually consumes.
 */
export type LegacyResult = AnalyzerResult;

/**
 * Run the legacy keyword-based match.
 *
 * @param input Resume + job description text.
 * @returns Score, matched/missing keywords, and human-readable feedback.
 */
export async function analyzeLegacy(input: LegacyInput): Promise<LegacyResult> {
    const { resumeText, jdText } = input;

    if (!resumeText || !jdText) {
        throw new Error('Missing resumeText or jdText');
    }

    // Helper to extract meaningful keywords using compromise
    const extractKeywords = (text: string) => {
        const doc = nlp(text);

        // Extract Topics and Nouns
        const topics = doc.topics().out('array');
        const nouns = doc.nouns().out('array');

        // Combine and normalize
        const combined = [...topics, ...nouns];
        const unique = new Set<string>();

        // Small dynamic stopword filter
        const noise = new Set(['experience', 'year', 'work', 'job', 'team', 'company', 'role', 'project', 'skill', 'business', 'process', 'manager', 'time', 'candidate', 'applicant', 'degree', 'opportunity', 'part', 'requirement', 'knowledge', 'system', 'fosters', 'engaging', 'excellence', 'lesson', 'lessons', 'responsibilities', 'responsibility', 'description', 'overview', 'summary']);

        combined.forEach((phrase: string) => {
            // Remove punctuation and normalize
            const cleaned = phrase.toLowerCase().replace(/[.,!?;:()]/g, '').trim();

            // If it's a multi-word phrase, we might want to keep it OR split it
            // For skills, multi-word is often good (e.g. "Google Classroom")
            if (cleaned.length > 2 && !noise.has(cleaned) && !/^\d+$/.test(cleaned)) {
                unique.add(cleaned);
            }

            // Also split by spaces to get individual words as backups
            const words = cleaned.split(/\s+/);
            if (words.length > 1) {
                words.forEach(word => {
                    if (word.length > 3 && !noise.has(word) && !/^\d+$/.test(word)) {
                        unique.add(word);
                    }
                });
            }
        });

        return Array.from(unique);
    };

    // Extract Keywords
    const jdKeywords = extractKeywords(jdText);
    const resumeKeywords = extractKeywords(resumeText);

    const resumeKeywordArray: string[] = Array.from(new Set(resumeKeywords));

    // Calculate Match
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    jdKeywords.forEach(kw => {
        // Fuzzy match: check if the exact word exists, or if a partial match exists
        // This prevents "JavaScript" vs "javascript" vs "java script" issues
        let isMatched = false;
        for (const rk of resumeKeywordArray) {
            if (rk.includes(kw) || kw.includes(rk)) {
                isMatched = true;
                break;
            }
        }

        if (isMatched) {
            matchedKeywords.push(kw);
        } else {
            missingKeywords.push(kw);
        }
    });

    // Deduplicate output arrays
    const finalMissing = Array.from(new Set(missingKeywords));
    const finalMatched = Array.from(new Set(matchedKeywords));

    // Limit the number of JD keywords evaluated to avoid diluting the score too much
    // with every single noun in a 3-page JD
    const importantJdKeywords = jdKeywords.slice(0, 50);
    const totalJDKeywords = importantJdKeywords.length || 1; // Prevent division by zero

    let localMatchCount = 0;
    importantJdKeywords.forEach(kw => {
        for (const rk of resumeKeywordArray) {
            if (rk.includes(kw) || kw.includes(rk)) {
                localMatchCount++;
                break;
            }
        }
    });

    const rawScore = Math.floor((localMatchCount / totalJDKeywords) * 100);

    // Add a heuristic bump since raw keywords aren't perfect
    const matchScore = Math.min(100, Math.max(0, rawScore + 15));

    const result: LegacyResult = {
        matchScore: matchScore,
        missingKeywords: finalMissing.length > 0 ? finalMissing : [],
        matchedKeywords: finalMatched.length > 0 ? finalMatched : [],
        feedback: `Analyzed core concepts from your resume against ${totalJDKeywords} key requirements. Your resume perfectly matches or aligns with ${finalMatched.length} core terms. ${finalMissing.length > 0
            ? 'Consider adding the highlighted missing keywords to improve your ATS score.'
            : 'Great job! No major keyword gaps detected.'
            }`,
        fix: finalMissing.length > 0 ? `I recommend updating your Summary or Experience bullet points to naturally include concepts like: ${finalMissing.slice(0, 5).join(', ')}` : '',
    };

    return result;
}
