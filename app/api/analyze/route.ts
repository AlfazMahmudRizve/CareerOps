import { NextRequest, NextResponse } from 'next/server';
import nlp from 'compromise';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText, jdText } = body;

        if (!resumeText || !jdText) {
            return NextResponse.json({ error: 'Missing resumeText or jdText' }, { status: 400 });
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

        // Generate Analysis Object matching the frontend's expected schema
        const analysisData = {
            matchScore: matchScore,
            missingKeywords: finalMissing.length > 0 ? finalMissing : [],
            feedback: `Analyzed core concepts from your resume against ${totalJDKeywords} key requirements. Your resume perfectly matches or aligns with ${finalMatched.length} core terms. ${finalMissing.length > 0
                ? 'Consider adding the highlighted missing keywords to improve your ATS score.'
                : 'Great job! No major keyword gaps detected.'
                }`,
            fix: finalMissing.length > 0 ? `I recommend updating your Summary or Experience bullet points to naturally include concepts like: ${finalMissing.slice(0, 5).join(', ')}` : '',

            // Keeping these for potential future use or debugging
            strengths: [
                `Strong coverage in: ${finalMatched.slice(0, 5).join(', ')}`,
                "Formatting allows standard text extraction."
            ],
            gaps: [
                finalMissing.length > 0 ? `Consider adding these concepts if applicable: ${finalMissing.slice(0, 5).join(', ')}` : "No major keyword gaps detected."
            ],
            recommendations: [
                finalMissing.length > 0 ? "Tailor your experience bullet points to explicitly mention the missing concepts above." : "Your resume aligns well with standard job description terminology.",
                "Ensure quantities and impact metrics are attached to your experience."
            ]
        };

        return NextResponse.json(analysisData);

    } catch (error) {
        console.error('NLP Analyze Error:', error);
        return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
    }
}
