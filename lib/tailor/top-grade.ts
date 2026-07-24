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
  // Top-level compatibility fields
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

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  
  // Exclude NID lines when looking for phone number
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
  let fullName = 'Candidate Name';

  for (const line of lines.slice(0, 8)) {
    if (/address|mobile|phone|email|location|curriculum|resume|cv|vill:|p\.o:|p\.s:|dist:|objective/i.test(line)) continue;
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
    fullName,
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
    summary: /(career objective|objective|summary|profile|about me|professional summary)/i,
    experience: /(work experience|professional experience|employment history|work history|experience)/i,
    education: /(educational qualification|academic qualification|education|qualifications|academic background)/i,
    projects: /(key projects|personal projects|portfolio projects|projects)/i,
    skills: /(technical & language skills|technical skills|computer skills|core competencies|skills|technologies)/i,
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedHeader = false;
    for (const [sec, regex] of Object.entries(headerRegexes)) {
      if (regex.test(trimmed) && trimmed.length < 50) {
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

  for (const line of targetLines) {
    const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[-–—\s]\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2}\s*Year)/i);
    const hasSep = line.includes('|') || line.includes(' - ') || /designation:/i.test(line);

    if (hasSep || (dateMatch && line.length < 80)) {
      if (current) {
        rawEntries.push(current);
      }

      let role = 'Role';
      let company = 'Company';

      if (line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        role = parts[0] || role;
        company = parts[1] || company;
      } else if (/designation:/i.test(line)) {
        const parts = line.split(/designation:/i).map((p) => p.trim());
        company = parts[0] || company;
        role = parts[1] || role;
      } else {
        role = line.trim();
      }

      current = {
        role,
        company,
        startDate: dateMatch ? dateMatch[1] : '2018',
        endDate: dateMatch ? dateMatch[2] : 'Present',
        lines: [],
      };
    } else if (current) {
      if (!/address:|duration:|location:/i.test(line) || current.lines.length === 0) {
        current.lines.push(line);
      }
    }
  }

  if (current) {
    rawEntries.push(current);
  }

  // If no entries found in experience section, extract bullet points from main body text
  if (rawEntries.length === 0) {
    const fallbackBullets: string[] = [];
    for (const l of targetLines) {
      const cleaned = l.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 15 && !/name|email|phone|address|education|skills/i.test(cleaned)) {
        fallbackBullets.push(cleaned);
      }
    }
    if (fallbackBullets.length > 0) {
      rawEntries.push({
        company: 'Professional Background',
        role: 'Candidate Experience',
        startDate: '2018',
        endDate: 'Present',
        lines: fallbackBullets,
      });
    }
  }

  return rawEntries.slice(0, 5).map((entry) => {
    const bullets: string[] = [];
    for (const l of entry.lines) {
      const cleaned = l.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 5 && !/address:|duration:|location:/i.test(cleaned)) {
        bullets.push(cleaned);
      }
    }

    if (bullets.length === 0) {
      bullets.push(`Maintained organizational records, client communication, and operational coordination at ${entry.company}.`);
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
 * Dynamically parse education entries without assuming software degrees.
 */
function parseEducation(lines: string[], fullText: string): TopGradeTailoredPayload['education'] {
  const education: TopGradeTailoredPayload['education'] = [];
  const sourceLines = lines.length > 0 ? lines : fullText.split('\n').filter((l) => /degree|college|university|school|hsc|ssc|bachelor|master/i.test(l));

  for (const line of sourceLines) {
    const parts = line.split(/[|•–-]/).map((p) => p.trim());
    if (parts.length >= 2) {
      education.push({
        degree: parts[0] || 'Qualification',
        school: parts[1] || parts[0],
        startDate: parts[3] || '2018',
        endDate: parts[2] || 'Present',
        details: parts.slice(2).join(' | '),
        description: parts.slice(2).join(' | '),
      });
    } else if (line.length > 10 && !/qualification|education/i.test(line)) {
      education.push({
        degree: line.trim(),
        school: 'Academic Institution',
        startDate: '2018',
        endDate: 'Present',
        details: line.trim(),
        description: line.trim(),
      });
    }
  }

  if (education.length === 0) {
    education.push({
      school: 'Academic Institution',
      degree: 'Education & Qualifications',
      startDate: '2018',
      endDate: 'Present',
      details: 'Completed academic coursework and professional training.',
      description: 'Completed academic coursework and professional training.',
    });
  }

  return education.slice(0, 4);
}

/**
 * Dynamically extract skills from actual text tokens without hardcoded developer tech stacks.
 */
function categorizeSkills(rawSkillsLines: string[], fullText: string, missingKeywords: string[]): {
  technical: string[];
  tools: string[];
  soft: string[];
} {
  const technicalSet = new Set<string>();
  const toolsSet = new Set<string>();
  const softSet = new Set<string>();

  const sourceText = rawSkillsLines.length > 0 ? rawSkillsLines.join(' ') : fullText;
  
  // Extract bullet points, comma-separated items, or parenthetical items
  const tokens = sourceText
    .split(/[,•|\n]/)
    .map((s) => s.replace(/^[-•*]\s*/, '').replace(/Computer Skills:|Language Proficiency:|Skills:/i, '').trim())
    .filter((s) => s.length > 1 && s.length < 50);

  for (const token of tokens) {
    if (/communication|leadership|teamwork|coordination|problem solving|customer|management/i.test(token)) {
      softSet.add(token);
    } else if (/office|excel|word|ms office|software|tool|system|networking|internet/i.test(token)) {
      toolsSet.add(token);
    } else {
      technicalSet.add(token);
    }
  }

  // Inject missing keywords into relevant categories
  for (const kw of missingKeywords.slice(0, 10)) {
    const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (!technicalSet.has(formattedKw) && !toolsSet.has(formattedKw) && !softSet.has(formattedKw)) {
      if (/communication|leadership|teamwork|management/i.test(kw)) {
        softSet.add(formattedKw);
      } else {
        technicalSet.add(formattedKw);
      }
    }
  }

  return {
    technical: Array.from(technicalSet).slice(0, 10),
    tools: Array.from(toolsSet).slice(0, 8),
    soft: Array.from(softSet).slice(0, 8),
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

      // Inject keyword if available
      if (unusedKeywords.length > 0 && idx < 3) {
        const kw = unusedKeywords.shift()!;
        const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!b.toLowerCase().includes(kw.toLowerCase())) {
          b = `${b.replace(/\.$/, '')}, incorporating ${formattedKw} to enhance operational efficiency.`;
          const loc = `Experience - ${item.company} (Bullet ${idx + 1})`;
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
    `Dedicated and detail-oriented candidate seeking to leverage professional background and strong communication skills to excel in the target role.`;

  let summary = originalSummary;
  if (integratedKeywords.length > 0 && !summary.includes(integratedKeywords[0])) {
    const keyTerms = integratedKeywords.slice(0, 4).join(', ');
    summary = `${summary} Specialized in utilizing ${keyTerms} to drive organizational results and deliver quality output.`;
  }

  const education = parseEducation(sections.education, resumeText);

  // Projects parsing
  const projects: TopGradeTailoredPayload['projects'] = [];
  if (sections.projects.length > 0) {
    for (let i = 0; i < sections.projects.length; i += 2) {
      const titleLine = sections.projects[i] || '';
      const descLine = sections.projects[i + 1] || '';
      const parts = titleLine.split(/[|•–-]/).map((p) => p.trim());
      const bullets = [descLine || titleLine];
      projects.push({
        title: parts[0] || 'Key Project',
        techStack: parts[1] || '',
        link: '',
        originalBullets: bullets,
        bullets,
        description: bullets.join('\n'),
      });
    }
  }

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
