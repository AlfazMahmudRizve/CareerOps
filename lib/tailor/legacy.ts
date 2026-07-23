import nlp from 'compromise';

export type TailoredResumePayload = {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    summary: string;
    experience: {
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        school: string;
        degree: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    projects: {
        title: string;
        techStack: string;
        link: string;
        description: string;
    }[];
    certifications?: {
        name: string;
        issuer: string;
        date: string;
    }[];
    skills: string;
    projectedScore: number;
    integratedKeywords: string[];
};

export type TailorInput = {
    resumeText: string;
    jdText: string;
    missingKeywords?: string[];
};

/**
 * Extract contact information from raw resume text using heuristics & regex.
 */
function parseContactInfo(text: string) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
    const portfolioMatch = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);

    // Heuristic for name: first line that looks like a clean name (no emails, URLs, or labels)
    let fullName = 'Candidate';
    for (const line of lines.slice(0, 5)) {
        if (/address|mobile|phone|email|location|curriculum|resume|cv/i.test(line)) continue;
        if (!line.includes('@') && !line.includes('http') && !line.includes('.com')) {
            const clean = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
            if (clean.length >= 3 && clean.length <= 40) {
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
 * Parse structured experience entries from experience section text lines.
 */
function parseExperience(lines: string[]): TailoredResumePayload['experience'] {
    if (!lines || lines.length === 0) return [];

    const entries: TailoredResumePayload['experience'] = [];
    let currentEntry: { company: string; role: string; startDate: string; endDate: string; description: string[] } | null = null;

    for (const line of lines) {
        const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[-–—\s]\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
        const hasSep = line.includes('|') || line.includes(' - ') || /designation:/i.test(line);

        if (hasSep || (currentEntry === null && line.length > 2)) {
            if (currentEntry) {
                entries.push({
                    ...currentEntry,
                    description: currentEntry.description.join(' '),
                });
            }

            let role = 'Professional';
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

            currentEntry = {
                role,
                company,
                startDate: dateMatch ? dateMatch[1] : '2018',
                endDate: dateMatch ? dateMatch[2] : 'Present',
                description: [],
            };
        } else if (currentEntry) {
            currentEntry.description.push(line);
        }
    }

    if (currentEntry) {
        entries.push({
            ...currentEntry,
            description: currentEntry.description.join(' '),
        });
    }

    return entries.slice(0, 5);
}

/**
 * Parse structured education entries from education section text lines.
 */
function parseEducation(lines: string[]): TailoredResumePayload['education'] {
    if (!lines || lines.length === 0) return [];

    const entries: TailoredResumePayload['education'] = [];
    for (let i = 0; i < lines.length; i += 2) {
        const line1 = lines[i] || '';
        const line2 = lines[i + 1] || '';
        const parts = line1.split(/[|•–-]/).map((p) => p.trim());

        entries.push({
            school: parts[0] || 'University',
            degree: parts[1] || line2 || 'Bachelor of Science',
            startDate: '2018',
            endDate: '2022',
            description: line2 ? line2 : '',
        });
    }

    return entries.slice(0, 3);
}

/**
 * Parse structured project entries from projects section text lines.
 */
function parseProjects(lines: string[]): TailoredResumePayload['projects'] {
    if (!lines || lines.length === 0) return [];

    const entries: TailoredResumePayload['projects'] = [];
    for (let i = 0; i < lines.length; i += 2) {
        const titleLine = lines[i] || '';
        const descLine = lines[i + 1] || '';

        const parts = titleLine.split(/[|•–-]/).map((p) => p.trim());
        entries.push({
            title: parts[0] || 'Key Project',
            techStack: parts[1] || 'TypeScript, React, Node.js',
            link: '',
            description: descLine || titleLine,
        });
    }

    return entries.slice(0, 3);
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
 * Legacy rule-based resume tailor.
 * Extracts contact info & sections, merges missing keywords into skills and summary.
 */
export async function tailorLegacy(input: TailorInput): Promise<TailoredResumePayload> {
    const { resumeText, jdText, missingKeywords: passedKeywords } = input;

    if (!resumeText || !jdText) {
        throw new Error('Missing resumeText or jdText');
    }

    const contact = parseContactInfo(resumeText);
    const sections = parseResumeSections(resumeText);

    const missingKeywords = passedKeywords && passedKeywords.length > 0
        ? passedKeywords
        : extractMissingKeywords(resumeText, jdText);

    // Existing skills parsed from text or default fallback
    const rawSkillsText = sections.skills.join(', ');
    const existingSkillsList = rawSkillsText
        .split(/[,•|]/)
        .map((s) => s.trim())
        .filter(Boolean);

    // Deduplicate and merge missing keywords into skills
    const mergedSkillsSet = new Set<string>(existingSkillsList);
    const integratedKeywords: string[] = [];

    for (const kw of missingKeywords) {
        const formattedKw = kw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!mergedSkillsSet.has(formattedKw) && !mergedSkillsSet.has(kw)) {
            mergedSkillsSet.add(formattedKw);
            integratedKeywords.push(formattedKw);
        }
        if (integratedKeywords.length >= 10) break;
    }

    const finalSkills = Array.from(mergedSkillsSet).join(', ') || 'TypeScript, JavaScript, React, Node.js, Problem Solving, Communication';

    // Summary processing
    let summaryText = sections.summary.join(' ').trim();
    if (!summaryText) {
        summaryText = `Driven and detail-oriented professional with experience in software development and project execution. Dedicated to delivering high-impact solutions and continuous technical improvement.`;
    }

    // Append target keywords to summary if not already present
    if (integratedKeywords.length > 0) {
        const keywordCallout = `Proficient in target industry standards including ${integratedKeywords.slice(0, 4).join(', ')}.`;
        if (!summaryText.includes(integratedKeywords[0])) {
            summaryText = `${summaryText} ${keywordCallout}`;
        }
    }

    const experience = parseExperience(sections.experience);
    const education = parseEducation(sections.education);
    const projects = parseProjects(sections.projects);

    const projectedScore = Math.min(94, Math.max(82, 75 + integratedKeywords.length * 2));

    return {
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin,
        portfolio: contact.portfolio,
        summary: summaryText,
        experience,
        education,
        projects,
        certifications: [],
        skills: finalSkills,
        projectedScore,
        integratedKeywords,
    };
}
