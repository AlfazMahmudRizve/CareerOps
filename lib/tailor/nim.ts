import { nim } from '../nim';
import {
    SYSTEM_PROMPT,
    assessInput,
    type GuardrailVerdict,
} from '../guardrail';
import type { TopGradeTailoredPayload } from './top-grade';
import type { TailorInput } from './legacy';

const MAX_INPUT_CHARS = 4000;
const MAX_SUMMARY_CHARS = 600;

/** Truncate string to at most `n` characters safely. */
function truncate(text: string, n: number): string {
    if (!text) return '';
    return text.length > n ? text.slice(0, n) : text;
}

const SOFT_SKILLS_SET = new Set([
    'leadership', 'communication', 'problem solving', 'agile', 'scrum',
    'teamwork', 'time management', 'critical thinking', 'collaboration',
    'project management', 'adaptability', 'creativity', 'negotiation',
    'mentorship', 'strategic planning', 'analytical thinking'
]);

const TOOLS_SKILLS_SET = new Set([
    'git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jira', 'vscode',
    'figma', 'ci/cd', 'linux', 'postman', 'webpack', 'vite', 'jenkins',
    'terraform', 'datadog', 'grafana', 'npm', 'yarn', 'pnpm', 'github',
    'gitlab', 'bitbucket', 'sentry', 'redis', 'kafka', 'rabbitmq'
]);

/**
 * Validate and coerce raw JSON returned by NIM into a clean TopGradeTailoredPayload.
 */
function validateTailorSchema(value: unknown): TopGradeTailoredPayload | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const v = value as Record<string, unknown>;

    // Personal object parsing & fallback
    const rawPersonal = (v.personal && typeof v.personal === 'object' && !Array.isArray(v.personal))
        ? (v.personal as Record<string, unknown>)
        : {};

    const fullName = typeof rawPersonal.fullName === 'string'
        ? rawPersonal.fullName.trim()
        : (typeof v.fullName === 'string' ? v.fullName.trim() : 'Candidate');

    const email = typeof rawPersonal.email === 'string'
        ? rawPersonal.email.trim()
        : (typeof v.email === 'string' ? v.email.trim() : '');

    const phone = typeof rawPersonal.phone === 'string'
        ? rawPersonal.phone.trim()
        : (typeof v.phone === 'string' ? v.phone.trim() : '');

    const linkedin = typeof rawPersonal.linkedin === 'string'
        ? rawPersonal.linkedin.trim()
        : (typeof v.linkedin === 'string' ? v.linkedin.trim() : '');

    const portfolio = typeof rawPersonal.portfolio === 'string'
        ? rawPersonal.portfolio.trim()
        : (typeof v.portfolio === 'string' ? v.portfolio.trim() : '');

    const presentAddress = typeof rawPersonal.presentAddress === 'string'
        ? rawPersonal.presentAddress.trim()
        : undefined;

    const summary = typeof v.summary === 'string' ? truncate(v.summary.trim(), MAX_SUMMARY_CHARS) : '';
    const originalSummary = typeof v.originalSummary === 'string' ? truncate(v.originalSummary.trim(), MAX_SUMMARY_CHARS) : summary;

    // Validate Experience array & bullets[]
    const experience: TopGradeTailoredPayload['experience'] = [];
    if (Array.isArray(v.experience)) {
        for (const item of v.experience) {
            if (item && typeof item === 'object') {
                const exp = item as Record<string, unknown>;
                
                // Parse bullets array
                let bullets: string[] = [];
                if (Array.isArray(exp.bullets)) {
                    bullets = exp.bullets
                        .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
                        .map((b) => b.trim());
                } else if (typeof exp.description === 'string' && exp.description.trim()) {
                    bullets = exp.description
                        .split('\n')
                        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
                        .filter((line) => line.length > 0);
                }

                if (bullets.length === 0) {
                    bullets = ['Delivered key operational objectives and contributed to team results.'];
                }

                // Parse originalBullets array
                let originalBullets: string[] = [];
                if (Array.isArray(exp.originalBullets)) {
                    originalBullets = exp.originalBullets
                        .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
                        .map((b) => b.trim());
                }
                if (originalBullets.length === 0) {
                    originalBullets = [...bullets];
                }

                experience.push({
                    company: typeof exp.company === 'string' ? exp.company.trim() : 'Company',
                    role: typeof exp.role === 'string' ? exp.role.trim() : 'Role',
                    startDate: typeof exp.startDate === 'string' ? exp.startDate.trim() : '',
                    endDate: typeof exp.endDate === 'string' ? exp.endDate.trim() : '',
                    originalBullets,
                    bullets,
                    description: bullets.join('\n'),
                });
            }
        }
    }

    // Validate Education array
    const education: TopGradeTailoredPayload['education'] = [];
    if (Array.isArray(v.education)) {
        for (const item of v.education) {
            if (item && typeof item === 'object') {
                const edu = item as Record<string, unknown>;
                const details = typeof edu.details === 'string'
                    ? edu.details.trim()
                    : (typeof edu.description === 'string' ? edu.description.trim() : undefined);

                education.push({
                    school: typeof edu.school === 'string' ? edu.school.trim() : 'Institution',
                    degree: typeof edu.degree === 'string' ? edu.degree.trim() : 'Degree',
                    startDate: typeof edu.startDate === 'string' ? edu.startDate.trim() : '',
                    endDate: typeof edu.endDate === 'string' ? edu.endDate.trim() : '',
                    details,
                    description: details,
                });
            }
        }
    }

    // Validate Projects array
    const projects: TopGradeTailoredPayload['projects'] = [];
    if (Array.isArray(v.projects)) {
        for (const item of v.projects) {
            if (item && typeof item === 'object') {
                const proj = item as Record<string, unknown>;
                let bullets: string[] = [];
                if (Array.isArray(proj.bullets)) {
                    bullets = proj.bullets
                        .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
                        .map((b) => b.trim());
                } else if (typeof proj.description === 'string' && proj.description.trim()) {
                    bullets = proj.description
                        .split('\n')
                        .map((l) => l.replace(/^[-•*]\s*/, '').trim())
                        .filter(Boolean);
                }

                if (bullets.length === 0) {
                    bullets = [typeof proj.description === 'string' ? proj.description.trim() : 'Built key application features.'];
                }

                let originalBullets: string[] = [];
                if (Array.isArray(proj.originalBullets)) {
                    originalBullets = proj.originalBullets
                        .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
                        .map((b) => b.trim());
                }
                if (originalBullets.length === 0) {
                    originalBullets = [...bullets];
                }

                projects.push({
                    title: typeof proj.title === 'string' ? proj.title.trim() : 'Project',
                    techStack: typeof proj.techStack === 'string' ? proj.techStack.trim() : '',
                    link: typeof proj.link === 'string' ? proj.link.trim() : '',
                    originalBullets,
                    bullets,
                    description: bullets.join('\n'),
                });
            }
        }
    }

    // Validate Skills object ({ technical, tools, soft })
    let skills: TopGradeTailoredPayload['skills'] = { technical: [], tools: [], soft: [] };

    if (v.skills && typeof v.skills === 'object' && !Array.isArray(v.skills)) {
        const s = v.skills as Record<string, unknown>;
        const technical = Array.isArray(s.technical)
            ? s.technical.filter((k): k is string => typeof k === 'string' && k.trim().length > 0).map((k) => k.trim())
            : [];
        const tools = Array.isArray(s.tools)
            ? s.tools.filter((k): k is string => typeof k === 'string' && k.trim().length > 0).map((k) => k.trim())
            : [];
        const soft = Array.isArray(s.soft)
            ? s.soft.filter((k): k is string => typeof k === 'string' && k.trim().length > 0).map((k) => k.trim())
            : [];

        skills = { technical, tools, soft };
    } else if (typeof v.skills === 'string') {
        const tokens = v.skills.split(/[,•|]/).map((k) => k.trim()).filter(Boolean);
        const technical: string[] = [];
        const tools: string[] = [];
        const soft: string[] = [];

        for (const token of tokens) {
            const lower = token.toLowerCase();
            if (SOFT_SKILLS_SET.has(lower)) {
                soft.push(token);
            } else if (TOOLS_SKILLS_SET.has(lower)) {
                tools.push(token);
            } else {
                technical.push(token);
            }
        }
        skills = { technical, tools, soft };
    }

    let projectedScore = 90;
    if (typeof v.projectedScore === 'number' && Number.isFinite(v.projectedScore)) {
        projectedScore = Math.max(0, Math.min(100, Math.round(v.projectedScore)));
    }

    const keywordMapping: TopGradeTailoredPayload['keywordMapping'] = [];
    if (Array.isArray(v.keywordMapping)) {
        for (const km of v.keywordMapping) {
            if (km && typeof km === 'object') {
                const item = km as Record<string, unknown>;
                if (typeof item.keyword === 'string' && typeof item.location === 'string') {
                    keywordMapping.push({
                        keyword: item.keyword.trim(),
                        location: item.location.trim(),
                    });
                }
            }
        }
    }

    const integratedKeywords: string[] = [];
    if (Array.isArray(v.integratedKeywords)) {
        for (const kw of v.integratedKeywords) {
            if (typeof kw === 'string' && kw.trim()) {
                integratedKeywords.push(kw.trim());
            }
        }
    }

    if (!fullName && !summary && skills.technical.length === 0) {
        return null;
    }

    return {
        personal: {
            fullName,
            email,
            phone,
            linkedin,
            portfolio,
            presentAddress,
        },
        fullName,
        email,
        phone,
        linkedin,
        portfolio,
        summary,
        originalSummary,
        experience,
        education,
        projects,
        skills,
        projectedScore,
        keywordMapping,
        integratedKeywords,
    };
}

/**
 * NIM LLM-backed resume tailor with anti-hallucination guardrails and STAR bullet enforcement.
 */
export async function tailorWithNim(input: TailorInput): Promise<TopGradeTailoredPayload> {
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
        'You are an elite Top-Grade ATS Resume Tailor. Your mission is to tailor the candidate\'s real resume ' +
        'against the job description using STAR-format bullet points.\n\n' +
        'CRITICAL TAILORING & ANTI-HALLUCINATION RULES:\n' +
        '1. ZERO FAKE CLAIMS: NEVER invent companies, degrees, dates, job titles, or unverified claims. Preserve original candidate facts.\n' +
        '2. STAR METHOD BULLET REWRITING: Every work experience bullet MUST strictly follow the STAR format (Strong Action Verb + Task/Context + Quantifiable Metric/Impact, e.g. "improving throughput by 35%", "reducing latency by 120ms").\n' +
        '3. JD KEYWORD INJECTION: Seamlessly inject target missing JD keywords into the candidate\'s actual experience bullets and summary.\n' +
        '4. OUTPUT FORMAT: You MUST return valid JSON conforming strictly to this exact schema:\n' +
        '{\n' +
        '  "personal": {\n' +
        '    "fullName": string,\n' +
        '    "email": string,\n' +
        '    "phone": string,\n' +
        '    "linkedin": string,\n' +
        '    "portfolio": string\n' +
        '  },\n' +
        '  "summary": string (tailored summary <=500 chars),\n' +
        '  "originalSummary": string (candidate original summary),\n' +
        '  "experience": [\n' +
        '    {\n' +
        '      "company": string,\n' +
        '      "role": string,\n' +
        '      "startDate": string,\n' +
        '      "endDate": string,\n' +
        '      "originalBullets": string[],\n' +
        '      "bullets": string[] (STAR format bullet points)\n' +
        '    }\n' +
        '  ],\n' +
        '  "education": [\n' +
        '    {\n' +
        '      "school": string,\n' +
        '      "degree": string,\n' +
        '      "startDate": string,\n' +
        '      "endDate": string,\n' +
        '      "details": string\n' +
        '    }\n' +
        '  ],\n' +
        '  "projects": [\n' +
        '    {\n' +
        '      "title": string,\n' +
        '      "techStack": string,\n' +
        '      "link": string,\n' +
        '      "originalBullets": string[],\n' +
        '      "bullets": string[]\n' +
        '    }\n' +
        '  ],\n' +
        '  "skills": {\n' +
        '    "technical": string[],\n' +
        '    "tools": string[],\n' +
        '    "soft": string[]\n' +
        '  },\n' +
        '  "projectedScore": integer (80-98 representing estimated post-tailor ATS score),\n' +
        '  "keywordMapping": [{"keyword": string, "location": string}],\n' +
        '  "integratedKeywords": string[]\n' +
        '}\n' +
        'No markdown surrounding or prose explanations outside the JSON object.';

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
