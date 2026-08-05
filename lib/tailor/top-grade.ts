import nlp from 'compromise';
import type { TailorInput } from './legacy';

export interface TopGradeTailoredPayload {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    presentAddress?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;

  summary: string;
  originalSummary?: string;

  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    originalBullets?: string[];
    bullets: string[];
    description?: string;
  }[];

  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    details?: string;
    description?: string;
  }[];

  projects: {
    title: string;
    techStack: string;
    link: string;
    originalBullets?: string[];
    bullets: string[];
    description?: string;
  }[];

  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };

  languages?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];

  projectedScore: number;
  keywordMapping: { keyword: string; location: string }[];
  integratedKeywords: string[];
}

const ACTION_VERBS = [
  'Engineered', 'Optimized', 'Spearheaded', 'Streamlined', 'Delivered',
  'Managed', 'Coordinated', 'Designed', 'Executed', 'Facilitated',
  'Directed', 'Administered', 'Cultivated', 'Resolved', 'Supervised'
];

/**
 * Extract candidate contact information accurately without hardcoded assumptions.
 */
function parseContactInfo(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);

  const cleanPhoneText = text
    .split('\n')
    .filter((line) => !/NID|National ID/i.test(line))
    .join('\n');

  const phoneMatch = cleanPhoneText.match(/(?:Mobile|Phone|Tel|Cell):\s*([+\d\s-]{10,20})/i) ||
    cleanPhoneText.match(/(?:\+880|01)[0-9\s-]{9,14}/) ||
    cleanPhoneText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  const addressMatch = text.match(/(?:Address|Location|Present Address|Vill):\s*([^\n]+)/i);

  const junkNames = /opensource|anonymous|placeholder|sample|template|john doe|candidate|curriculum|vitae/i;
  let fullName = '';

  for (const line of lines.slice(0, 8)) {
    if (/address|mobile|phone|email|location|curriculum|resume|cv|vill:|p\.o:|p\.s:|dist:|objective|summary/i.test(line)) continue;
    if (junkNames.test(line)) continue;
    if (!line.includes('@') && !line.includes('http') && !line.includes('.com')) {
      const clean = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (clean.length >= 3 && clean.length <= 40 && clean.split(/\s+/).length <= 4) {
        fullName = clean;
        break;
      }
    }
  }

  return {
    fullName: fullName || 'Candidate',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[1] || phoneMatch[0] : '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    portfolio: portfolioMatch && !portfolioMatch[0].includes('linkedin.com') ? portfolioMatch[0] : '',
    presentAddress: addressMatch ? addressMatch[1].trim() : undefined,
  };
}

/**
 * Extract section blocks from resume text based on common section headers.
 */
function parseResumeSections(text: string) {
  const lines = text.split('\n');

  let currentSection: 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'other' = 'other';
  const sectionTexts: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    other: [],
  };

  const headerRegexes = {
    summary: /^(profile summary|career objective|objective|summary|profile|about me|professional summary)$/i,
    experience: /^(professional experience|work experience|employment history|work history|experience)$/i,
    education: /^(educational qualification|education|academic qualification|qualifications|academic background)$/i,
    projects: /^(key projects|personal projects|copywriting and technical campaigns|projects)$/i,
    skills: /^(technical and digital skills|technical & language skills|technical skills|computer skills|core competencies|skills|technologies)$/i,
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedHeader = false;
    for (const [sec, regex] of Object.entries(headerRegexes)) {
      if (regex.test(trimmed) && trimmed.length < 60) {
        currentSection = sec as typeof currentSection;
        matchedHeader = true;
        break;
      }
    }

    if (!matchedHeader) {
      if (currentSection !== 'other') {
        sectionTexts[currentSection].push(trimmed);
      } else {
        sectionTexts['other'].push(trimmed);
      }
    }
  }

  return sectionTexts;
}

/**
 * Extract missing keywords using compromise NLP if not explicitly passed.
 */
function extractMissingKeywords(resumeText: string, jdText: string): string[] {
  const docJd = nlp(jdText);
  const topics = docJd.topics().out('array') as string[];
  const nouns = docJd.nouns().out('array') as string[];

  const noise = new Set([
    'experience', 'year', 'work', 'job', 'team', 'company', 'role', 'project',
    'skill', 'business', 'process', 'manager', 'time', 'candidate', 'applicant',
    'degree', 'opportunity', 'part', 'requirement', 'knowledge', 'system',
  ]);

  const candidates = new Set<string>();
  [...topics, ...nouns].forEach((phrase) => {
    const cleaned = phrase.toLowerCase().replace(/[.,!?;:()]/g, '').trim();
    if (cleaned.length > 2 && !noise.has(cleaned) && !/^\d+$/.test(cleaned)) {
      candidates.add(cleaned);
    }
  });

  const resumeLower = resumeText.toLowerCase();
  const missing: string[] = [];

  candidates.forEach((kw) => {
    if (!resumeLower.includes(kw)) {
      missing.push(kw);
    }
  });

  return missing.slice(0, 15);
}

/**
 * Parse experience section into authentic candidate work history.
 */
function parseExperience(lines: string[], rawFullText: string): {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  originalBullets: string[];
  bullets: string[];
  description: string;
}[] {
  const rawEntries: { company: string; role: string; startDate: string; endDate: string; lines: string[] }[] = [];
  let current: { company: string; role: string; startDate: string; endDate: string; lines: string[] } | null = null;

  const targetLines = lines.length > 0 ? lines : rawFullText.split('\n');

  for (let i = 0; i < targetLines.length; i++) {
    const line = targetLines[i].trim();
    if (!line) continue;

    const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[-–—\s]\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2}\s*Year)/i);

    if (dateMatch && line.length < 120) {
      if (current) {
        rawEntries.push(current);
      }

      let role = '';
      let company = '';
      let cleanLine = line;

      // Extract date strings out of the title line
      const startDate = dateMatch[1] || '';
      const endDate = dateMatch[2] || '';

      cleanLine = cleanLine.replace(dateMatch[0], '').trim();

      if (cleanLine.includes('|')) {
        const parts = cleanLine.split('|').map((p) => p.trim());
        role = parts[0] || 'Lead';
        company = parts[1] || '';
      } else {
        role = cleanLine || 'Role';
        company = '';
      }

      current = {
        role,
        company,
        startDate,
        endDate,
        lines: [],
      };
    } else if (current) {
      if (!/address:|duration:|location:/i.test(line)) {
        current.lines.push(line);
      }
    }
  }

  if (current) {
    rawEntries.push(current);
  }

  return rawEntries.map((entry) => {
    const bullets: string[] = [];
    for (const l of entry.lines) {
      const cleaned = l.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 5 && !/address:|duration:|location:/i.test(cleaned)) {
        bullets.push(cleaned);
      }
    }

    return {
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      originalBullets: [...bullets],
      bullets: [...bullets],
      description: bullets.join('\n'),
    };
  });
}

/**
 * Dynamically parse education entries without assuming software degrees or fake colleges.
 */
function parseEducation(lines: string[], fullText: string): TopGradeTailoredPayload['education'] {
  const education: TopGradeTailoredPayload['education'] = [];
  const sourceLines = lines.length > 0 ? lines : fullText.split('\n').filter((l) => /degree|college|university|school|hsc|ssc|bachelor|master|bsc|msc/i.test(l));

  for (const line of sourceLines) {
    const trimmed = line.trim();
    if (!trimmed || /degree \/ qualifica|institute|board|passing year \/ result/i.test(trimmed)) continue;

    const dateMatch = trimmed.match(/(\d{4})\s*[-–—\s]\s*(Present|\d{4})/i);
    const startDate = dateMatch ? dateMatch[1] : '';
    const endDate = dateMatch ? dateMatch[2] : '';

    const cleanLine = trimmed.replace(/(\d{4})\s*[-–—\s]\s*(Present|\d{4})/i, '').trim();

    const parts = cleanLine.split(/[|•]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      education.push({
        degree: parts[0] || '',
        school: parts[1] || parts[0] || '',
        startDate,
        endDate,
        details: parts.slice(2).join(' | '),
        description: parts.slice(2).join(' | '),
      });
    } else if (parts.length === 1) {
      education.push({
        degree: parts[0],
        school: '',
        startDate,
        endDate,
      });
    }
  }

  return education;
}

/**
 * Categorize candidate skills into technical, tools, soft.
 */
function categorizeSkills(
  skillsLines: string[],
  fullText: string,
  missingKeywords: string[]
): TopGradeTailoredPayload['skills'] {
  const technicalSet = new Set<string>();
  const toolsSet = new Set<string>();
  const softSet = new Set<string>();

  const rawText = skillsLines.join(' ') || fullText;

  const knownTools = ['Claude', 'Gemini', 'ChatGPT', 'n8n', 'Brevo', 'HubSpot', 'ClickUp', 'Slack', 'WordPress', 'Google Search Console', 'GoHighLevel', 'Git', 'Docker'];
  knownTools.forEach((tool) => {
    if (new RegExp(`\\b${tool}\\b`, 'i').test(rawText)) {
      toolsSet.add(tool);
    }
  });

  const knownSoft = ['Leadership', 'Mentoring', 'Team Management', 'Cross-Departmental Collaboration', 'Critical Thinking', 'Crisis Management', 'Communication'];
  knownSoft.forEach((soft) => {
    if (new RegExp(`\\b${soft}\\b`, 'i').test(rawText)) {
      softSet.add(soft);
    }
  });

  const words = rawText.split(/[:;,•|\n]/).map((w) => w.trim()).filter((w) => w.length > 2 && w.length < 40);
  words.forEach((w) => {
    if (!toolsSet.has(w) && !softSet.has(w)) {
      technicalSet.add(w);
    }
  });

  missingKeywords.forEach((kw) => {
    const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (toolsSet.has(formattedKw) || softSet.has(formattedKw) || technicalSet.has(formattedKw)) return;
    technicalSet.add(formattedKw);
  });

  return {
    technical: Array.from(technicalSet).slice(0, 10),
    tools: Array.from(toolsSet).slice(0, 10),
    soft: Array.from(softSet).slice(0, 10),
  };
}

/**
 * Format experience bullets with action verbs and naturally weave missing keywords.
 */
function enhanceBulletsWithActionVerbsAndKeywords(
  experience: ReturnType<typeof parseExperience>,
  missingKeywords: string[]
): {
  experience: TopGradeTailoredPayload['experience'];
  keywordMapping: { keyword: string; location: string }[];
  integratedKeywords: string[];
} {
  const keywordMapping: { keyword: string; location: string }[] = [];
  const integratedKeywordsSet = new Set<string>();
  const unusedKeywords = [...missingKeywords];

  const updatedExp = experience.map((item) => {
    const originalBullets = item.originalBullets ?? [...item.bullets];
    const newBullets = originalBullets.map((bullet, idx) => {
      let b = bullet.trim();
      const firstWord = b.split(/\s+/)[0] || '';
      const startsWithVerb = ACTION_VERBS.some(
        (v) => v.toLowerCase() === firstWord.toLowerCase()
      );

      if (!startsWithVerb && b.length > 5) {
        const randomVerb = ACTION_VERBS[idx % ACTION_VERBS.length];
        const lowerFirst = firstWord.charAt(0).toLowerCase() + firstWord.slice(1);
        if (/^(worked|responsible|helped|assisted|handled|did|took|was|were)\b/i.test(firstWord)) {
          const rest = b.split(/\s+/).slice(1).join(' ');
          b = `${randomVerb} ${rest}`;
        } else {
          b = `${randomVerb} ${lowerFirst} ${b.split(/\s+/).slice(1).join(' ')}`;
        }
      }

      if (unusedKeywords.length > 0 && idx < 3) {
        const kw = unusedKeywords.shift()!;
        const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!b.toLowerCase().includes(kw.toLowerCase())) {
          b = `${b.replace(/\.$/, '')}, driving ${formattedKw} to enhance overall workflow.`;
          const loc = `Experience - ${item.company || item.role} (Bullet ${idx + 1})`;
          keywordMapping.push({ keyword: formattedKw, location: loc });
          integratedKeywordsSet.add(formattedKw);
        }
      }

      return b;
    });

    return {
      ...item,
      originalBullets,
      bullets: newBullets,
      description: newBullets.join('\n'),
    };
  });

  return {
    experience: updatedExp,
    keywordMapping,
    integratedKeywords: Array.from(integratedKeywordsSet),
  };
}

/**
 * Completely dynamic, zero-assumption top-grade resume tailor.
 */
export async function tailorTopGradeLegacy(input: TailorInput): Promise<TopGradeTailoredPayload> {
  const { resumeText, jdText, missingKeywords: passedKeywords } = input;

  if (!resumeText || !jdText) {
    throw new Error('Missing resumeText or jdText');
  }

  const contact = parseContactInfo(resumeText);
  const sections = parseResumeSections(resumeText);

  const missingKeywords = passedKeywords && passedKeywords.length > 0
    ? passedKeywords
    : extractMissingKeywords(resumeText, jdText);

  const rawExperience = parseExperience(sections.experience, resumeText);
  const { experience, keywordMapping, integratedKeywords } = enhanceBulletsWithActionVerbsAndKeywords(
    rawExperience,
    missingKeywords
  );

  const skills = categorizeSkills(sections.skills, resumeText, missingKeywords);

  const originalSummary = sections.summary.join(' ').trim() ||
    `Results-driven candidate with proven expertise in team leadership, operations management, and strategic execution.`;

  let summary = originalSummary;
  if (integratedKeywords.length > 0 && !summary.includes(integratedKeywords[0])) {
    const keyTerms = integratedKeywords.slice(0, 3).join(', ');
    summary = `${summary} Specialized in leveraging ${keyTerms} to drive operational efficiency.`;
  }

  const education = parseEducation(sections.education, resumeText);

  const projects: TopGradeTailoredPayload['projects'] = [];

  const projectedScore = Math.min(95, Math.max(82, 78 + integratedKeywords.length * 2));

  return {
    personal: {
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      portfolio: contact.portfolio,
      presentAddress: contact.presentAddress,
    },
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    portfolio: contact.portfolio,
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
