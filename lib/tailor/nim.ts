import { nim } from '../nim';
import {
    SYSTEM_PROMPT,
    assessInput,
    type GuardrailVerdict,
} from '../guardrail';
import type { TailoredResumePayload, TailorInput } from './legacy';

const MAX_INPUT_CHARS = 4000;
const MAX_SUMMARY_CHARS = 500;
const MAX_BULLET_CHARS = 400;

/** Truncate string to at most `n` characters safely. */
function truncate(text: string, n: number): string {
    if (!text) return '';
    return text.length > n ? text.slice(0, n) : text;
}

/** Validate and coerce raw JSON returned by NIM into a clean TailoredResumePayload. */
function validateTailorSchema(value: unknown): TailoredResumePayload | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const v = value as Record<string, unknown>;

    const fullName = typeof v.fullName === 'string' ? v.fullName.trim() : 'Candidate';
    const email = typeof v.email === 'string' ? v.email.trim() : '';
    const phone = typeof v.phone === 'string' ? v.phone.trim() : '';
    const linkedin = typeof v.linkedin === 'string' ? v.linkedin.trim() : '';
    const portfolio = typeof v.portfolio === 'string' ? v.portfolio.trim() : '';

    const summary = typeof v.summary === 'string' ? truncate(v.summary.trim(), MAX_SUMMARY_CHARS) : '';

    // Experience array
    const experience: TailoredResumePayload['experience'] = [];
    if (Array.isArray(v.experience)) {
        for (const item of v.experience) {
            if (item && typeof item === 'object') {
                const exp = item as Record<string, unknown>;
                experience.push({
                    company: typeof exp.company === 'string' ? exp.company.trim() : 'Company',
                    role: typeof exp.role === 'string' ? exp.role.trim() : 'Role',
                    startDate: typeof exp.startDate === 'string' ? exp.startDate.trim() : '',
                    endDate: typeof exp.endDate === 'string' ? exp.endDate.trim() : '',
                    description: typeof exp.description === 'string' ? truncate(exp.description.trim(), MAX_BULLET_CHARS) : '',
                });
            }
        }
    }

    // Education array
    const education: TailoredResumePayload['education'] = [];
    if (Array.isArray(v.education)) {
        for (const item of v.education) {
            if (item && typeof item === 'object') {
                const edu = item as Record<string, unknown>;
                education.push({
                    school: typeof edu.school === 'string' ? edu.school.trim() : 'Institution',
                    degree: typeof edu.degree === 'string' ? edu.degree.trim() : 'Degree',
                    startDate: typeof edu.startDate === 'string' ? edu.startDate.trim() : '',
                    endDate: typeof edu.endDate === 'string' ? edu.endDate.trim() : '',
                    description: typeof edu.description === 'string' ? truncate(edu.description.trim(), MAX_BULLET_CHARS) : '',
                });
            }
        }
    }

    // Projects array
    const projects: TailoredResumePayload['projects'] = [];
    if (Array.isArray(v.projects)) {
        for (const item of v.projects) {
            if (item && typeof item === 'object') {
                const proj = item as Record<string, unknown>;
                projects.push({
                    title: typeof proj.title === 'string' ? proj.title.trim() : 'Project',
                    techStack: typeof proj.techStack === 'string' ? proj.techStack.trim() : '',
                    link: typeof proj.link === 'string' ? proj.link.trim() : '',
                    description: typeof proj.description === 'string' ? truncate(proj.description.trim(), MAX_BULLET_CHARS) : '',
                });
            }
        }
    }

    // Certifications array optional
    const certifications: TailoredResumePayload['certifications'] = [];
    if (Array.isArray(v.certifications)) {
        for (const item of v.certifications) {
            if (item && typeof item === 'object') {
                const cert = item as Record<string, unknown>;
                certifications.push({
                    name: typeof cert.name === 'string' ? cert.name.trim() : 'Certification',
                    issuer: typeof cert.issuer === 'string' ? cert.issuer.trim() : '',
                    date: typeof cert.date === 'string' ? cert.date.trim() : '',
                });
            }
        }
    }

    const skills = typeof v.skills === 'string' ? v.skills.trim() : '';

    let projectedScore = 88;
    if (typeof v.projectedScore === 'number' && Number.isFinite(v.projectedScore)) {
        projectedScore = Math.max(0, Math.min(100, Math.round(v.projectedScore)));
    }

    const integratedKeywords: string[] = [];
    if (Array.isArray(v.integratedKeywords)) {
        for (const kw of v.integratedKeywords) {
            if (typeof kw === 'string' && kw.trim()) {
                integratedKeywords.push(kw.trim());
            }
        }
    }

    // Require at least a valid contact or summary/skills to be valid
    if (!fullName && !summary && !skills) {
        return null;
    }

    return {
        fullName,
        email,
        phone,
        linkedin,
        portfolio,
        summary,
        experience,
        education,
        projects,
        certifications,
        skills,
        projectedScore,
        integratedKeywords,
    };
}

/**
 * NIM LLM-backed resume tailor with anti-hallucination guardrails.
 */
export async function tailorWithNim(input: TailorInput): Promise<TailoredResumePayload> {
    const verdict: GuardrailVerdict = assessInput({
        resumeText: input.resumeText ?? '',
        jdText: input.jdText ?? '',
    });

    if (!verdict.allowed || !verdict.sanitized) {
        const reason = verdict.reason ?? 'input not allowed';
        throw new Error(`GUARDRAIL_BLOCKED: ${reason}`);
    }

    const resumeText = truncate(verdict.sanitized.resumeText, MAX_INPUT_CHARS);
    const jdText = truncate(verdict.sanitized.jdText, MAX_INPUT_CHARS);
    const missingKeywordsStr = input.missingKeywords ? JSON.stringify(input.missingKeywords) : '[]';

    const systemPrompt = SYSTEM_PROMPT + '\n\n' +
        'You are an elite ATS Resume Tailor. Your mission is to tailor the candidate\'s real resume ' +
        'against the job description.\n' +
        'CRITICAL ANTI-HALLUCINATION RULES:\n' +
        '1. ZERO FAKE CLAIMS: NEVER invent companies, degrees, dates, job titles, or tools not present in the original resume.\n' +
        '2. RE-WORD REAL EXPERIENCE: Strictly rephrase existing bullet points and summary to naturally highlight relevant keywords from the job description.\n' +
        '3. OUTPUT FORMAT: You MUST return valid JSON conforming to this exact schema:\n' +
        '{\n' +
        '  "fullName": string,\n' +
        '  "email": string,\n' +
        '  "phone": string,\n' +
        '  "linkedin": string,\n' +
        '  "portfolio": string,\n' +
        '  "summary": string (<=500 chars, tailored for JD alignment),\n' +
        '  "experience": [{"company": string, "role": string, "startDate": string, "endDate": string, "description": string (<=400 chars)}],\n' +
        '  "education": [{"school": string, "degree": string, "startDate": string, "endDate": string, "description": string}],\n' +
        '  "projects": [{"title": string, "techStack": string, "link": string, "description": string}],\n' +
        '  "skills": string (comma-separated, merged with matching skills),\n' +
        '  "projectedScore": integer (80-98 representing estimated post-tailor ATS score),\n' +
        '  "integratedKeywords": string[] (list of missing keywords successfully integrated)\n' +
        '}\n' +
        'No prose or explanations outside the JSON object.';

    const userPrompt =
        `Tailor this candidate's resume for the target job description.\n\n` +
        `TARGET JOB DESCRIPTION:\n"""${jdText}"""\n\n` +
        `IDENTIFIED MISSING KEYWORDS:\n${missingKeywordsStr}\n\n` +
        `CANDIDATE RESUME:\n"""${resumeText}"""\n\n` +
        `Return the tailored JSON object now.`;

    const raw = await nim.chat(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        {
            temperature: 0.2,
            topP: 0.7,
            maxTokens: 3072,
            timeoutMs: 15_000,
        },
    );

    const validated = validateTailorSchema(raw);
    if (!validated) {
        throw new Error('NIM schema invalid: tailorWithNim response failed validation');
    }

    return validated;
}
