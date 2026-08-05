import { groqChat } from '../groq';
import { SYSTEM_PROMPT, assessInput, type GuardrailVerdict } from '../guardrail';
import type { TopGradeTailoredPayload } from './top-grade';
import type { TailorInput } from './legacy';

const MAX_INPUT_CHARS = 4000;

function truncate(text: string, n: number): string {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) : text;
}

/**
 * Ultra-fast Groq LPU LLM-backed resume tailor.
 */
export async function tailorWithGroq(input: TailorInput): Promise<TopGradeTailoredPayload> {
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
    '2. STAR METHOD BULLET REWRITING: Every work experience bullet MUST strictly follow the STAR format (Strong Action Verb + Task/Context + Quantifiable Metric/Impact).\n' +
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
    '      "bullets": string[]\n' +
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
    '  "projectedScore": integer (80-98),\n' +
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

  const raw = await groqChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 3072,
      timeoutMs: 25_000,
    }
  );

  return raw as unknown as TopGradeTailoredPayload;
}
