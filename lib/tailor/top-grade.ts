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
  'Engineered', 'Developed', 'Optimized', 'Architected', 'Spearheaded',
  'Implemented', 'Streamlined', 'Delivered', 'Accelerated', 'Formulated',
  'Designed', 'Orchestrated', 'Built', 'Created', 'Led', 'Managed',
  'Scaled', 'Automated', 'Enhanced', 'Revamped'
];

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
 * Extract contact information from raw resume text using heuristics & regex.
 */
function parseContactInfo(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  const addressMatch = text.match(/(?:Address|Location|Present Address):\s*([^\n]+)/i);

  const junkNames = /opensource|anonymous|placeholder|sample|template|john doe|candidate|curriculum|vitae/i;
  let fullName = 'Arman Hossain';

  for (const line of lines.slice(0, 8)) {
    if (/address|mobile|phone|email|location|curriculum|resume|cv|vill:|p\.o:|p\.s:|dist:/i.test(line)) continue;
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
    phone: phoneMatch ? phoneMatch[0] : '',
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
  };

  const headerRegexes = {
    summary: /(summary|profile|about me|career objective|objective|professional summary)/i,
    experience: /(work experience|professional experience|employment history|work history|experience)/i,
    education: /(educational qualification|academic qualification|education|qualifications|academic background)/i,
    projects: /(key projects|personal projects|portfolio projects|projects)/i,
    skills: /(technical & language skills|technical skills|computer skills|core competencies|expertise|skills|technologies)/i,
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

    if (!matchedHeader && currentSection !== 'other') {
      sectionTexts[currentSection].push(trimmed);
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
 * Parse experience section into companies with original and tailored bullet lists.
 */
function parseExperience(lines: string[]): {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  originalBullets: string[];
  bullets: string[];
  description: string;
}[] {
  if (!lines || lines.length === 0) return [];

  const rawEntries: { company: string; role: string; startDate: string; endDate: string; lines: string[] }[] = [];
  let current: { company: string; role: string; startDate: string; endDate: string; lines: string[] } | null = null;

  for (const line of lines) {
    const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[-–—\s]\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    const hasSep = line.includes('|') || line.includes(' - ') || /designation:/i.test(line);

    if (hasSep || (current === null && line.length > 2)) {
      if (current) {
        rawEntries.push(current);
      }

      let role = 'Software Engineer';
      let company = 'Tech Company';

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
        startDate: dateMatch ? dateMatch[1] : '2020',
        endDate: dateMatch ? dateMatch[2] : 'Present',
        lines: [],
      };
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    rawEntries.push(current);
  }

  return rawEntries.slice(0, 5).map((entry) => {
    const bullets: string[] = [];
    for (const l of entry.lines) {
      const cleaned = l.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 5) {
        bullets.push(cleaned);
      }
    }

    if (bullets.length === 0) {
      bullets.push(`Delivered core software features and collaborated across cross-functional teams at ${entry.company}.`);
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
 * Categorize skills into technical, tools, and soft arrays.
 */
function categorizeSkills(rawSkillsLines: string[], missingKeywords: string[]): {
  technical: string[];
  tools: string[];
  soft: string[];
} {
  const technicalSet = new Set<string>();
  const toolsSet = new Set<string>();
  const softSet = new Set<string>();

  const allTokens = rawSkillsLines
    .flatMap((line) => line.split(/[,•|]/))
    .map((s) => s.trim())
    .filter(Boolean);

  for (const token of allTokens) {
    const lower = token.toLowerCase();
    if (SOFT_SKILLS_SET.has(lower)) {
      softSet.add(token);
    } else if (TOOLS_SKILLS_SET.has(lower)) {
      toolsSet.add(token);
    } else {
      technicalSet.add(token);
    }
  }

  // Ensure default fallbacks if empty
  if (technicalSet.size === 0) {
    ['TypeScript', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST API'].forEach((s) => technicalSet.add(s));
  }
  if (toolsSet.size === 0) {
    ['Git', 'Docker', 'VSCode', 'Postman', 'CI/CD'].forEach((s) => toolsSet.add(s));
  }
  if (softSet.size === 0) {
    ['Problem Solving', 'Teamwork', 'Communication', 'Agile'].forEach((s) => softSet.add(s));
  }

  // Inject missing keywords into relevant categories
  for (const kw of missingKeywords.slice(0, 10)) {
    const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const lower = kw.toLowerCase();

    if (SOFT_SKILLS_SET.has(lower)) {
      softSet.add(formattedKw);
    } else if (TOOLS_SKILLS_SET.has(lower)) {
      toolsSet.add(formattedKw);
    } else if (!technicalSet.has(formattedKw) && !toolsSet.has(formattedKw) && !softSet.has(formattedKw)) {
      technicalSet.add(formattedKw);
    }
  }

  return {
    technical: Array.from(technicalSet),
    tools: Array.from(toolsSet),
    soft: Array.from(softSet),
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

      if (!startsWithVerb) {
        const randomVerb = ACTION_VERBS[idx % ACTION_VERBS.length];
        // Capitalize first letter of old sentence or remove weak verb
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
          b = `${b.replace(/\.$/, '')}, utilizing ${formattedKw} to enhance scalability and performance.`;
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
 * Legacy rule-based parser & tailor returning TopGradeTailoredPayload.
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

  const rawExperience = parseExperience(sections.experience);
  const { experience, keywordMapping, integratedKeywords } = enhanceBulletsWithActionVerbsAndKeywords(
    rawExperience,
    missingKeywords
  );

  const skills = categorizeSkills(sections.skills, missingKeywords);

  const originalSummary = sections.summary.join(' ').trim() ||
    'Experienced software professional dedicated to designing and building high-performance scalable web applications and system architectures.';

  let summary = originalSummary;
  if (integratedKeywords.length > 0 && !summary.includes(integratedKeywords[0])) {
    const keyTerms = integratedKeywords.slice(0, 4).join(', ');
    summary = `${summary} Specialized in leveraging ${keyTerms} to drive business impact and deliver robust software solutions.`;
  }

  // Parse education
  const education: TopGradeTailoredPayload['education'] = [];
  if (sections.education.length > 0) {
    for (let i = 0; i < sections.education.length; i += 2) {
      const line1 = sections.education[i] || '';
      const line2 = sections.education[i + 1] || '';
      const parts = line1.split(/[|•–-]/).map((p) => p.trim());
      education.push({
        school: parts[0] || 'University',
        degree: parts[1] || line2 || 'Bachelor of Science in Computer Science',
        startDate: '2018',
        endDate: '2022',
        description: line2 || line1,
        details: line2 || line1,
      });
    }
  } else {
    education.push({
      school: 'State University',
      degree: 'Bachelor of Science in Computer Science',
      startDate: '2018',
      endDate: '2022',
      details: 'Relevant Coursework: Data Structures, Algorithms, Software Engineering',
      description: 'Relevant Coursework: Data Structures, Algorithms, Software Engineering',
    });
  }

  // Parse projects
  const projects: TopGradeTailoredPayload['projects'] = [];
  if (sections.projects.length > 0) {
    for (let i = 0; i < sections.projects.length; i += 2) {
      const titleLine = sections.projects[i] || '';
      const descLine = sections.projects[i + 1] || '';
      const parts = titleLine.split(/[|•–-]/).map((p) => p.trim());
      const bullets = [descLine || titleLine];
      projects.push({
        title: parts[0] || 'Web Project',
        techStack: parts[1] || 'TypeScript, React, Node.js',
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
