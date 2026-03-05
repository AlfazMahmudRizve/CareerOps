import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText } = body;

        if (!resumeText) {
            return NextResponse.json({ error: 'Missing resumeText' }, { status: 400 });
        }

        // ==========================================
        // 1. Raw Text Pre-processing
        // ==========================================
        const cleanText = resumeText
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n');

        const lines = cleanText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

        // ==========================================
        // 2. Extract Contact Info via Regex
        // ==========================================
        const fullText = lines.join(' ');

        const emailMatch = fullText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        const email = emailMatch ? emailMatch[0] : '';

        const phoneMatch = fullText.match(/(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i);
        const linkedin = linkedinMatch ? linkedinMatch[0] : '';

        // Portfolio: Exclude common email providers and ensure it's not part of an email
        const portfolioMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?(github\.com\/[A-Za-z0-9_-]+|(?!gmail|outlook|yahoo|hotmail|icloud|mail|google)[A-Za-z0-9_-]+\.(?:me|dev|io|com|org|net|edu))\/?(?!\S)/i);
        let portfolio = portfolioMatch ? portfolioMatch[0] : '';
        if (portfolio && fullText.includes(`@${portfolio}`)) portfolio = ''; // Double check it's not an email domain

        // ==========================================
        // 3. Name Extraction (first non-contact line)
        // ==========================================
        let fullName = '';
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (
                line.length > 2 && line.length < 50 &&
                !/\d{3}/.test(line) &&              // No phone-like numbers
                !line.includes('@') &&               // No emails
                !line.includes('http') &&            // No URLs
                !line.includes('.com') &&            // No domains
                !line.includes('.me') &&
                !line.includes('linkedin')
            ) {
                fullName = line;
                break;
            }
        }

        // ==========================================
        // 4. Section Detection (Fuzzy)
        // ==========================================
        // Instead of requiring EXACT line matches, we search for keywords
        // that commonly introduce sections, even if they are part of a longer line.

        type SectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'personalProfile';

        const sectionPatterns: Record<SectionKey, RegExp> = {
            summary: /(?:^|\b)(summary|profile|about\s*me|professional\s*summary|objective|career\s*summary)(?:\b|$)/i,
            experience: /(?:^|\b)(experience|work\s*experience|employment|work\s*history|professional\s*experience)(?:\b|$)/i,
            education: /(?:^|\b)(education|academic|qualification|degree)(?:\b|$)/i,
            skills: /(?:^|\b)(skills|technical\s*skills|core\s*competencies|technologies|tech\s*stack|programming\s*languages)(?:\b|$)/i,
            projects: /(?:^|\b)(projects|personal\s*projects|key\s*projects|notable\s*projects)(?:\b|$)/i,
            certifications: /(?:^|\b)(certifications|licenses|certificates|awards|extracurricular)(?:\b|$)/i,
            personalProfile: /(?:^|\b)(personal\s*details|personal\s*information|profile\s*details|additional\s*information|personal\s*profile)(?:\b|$)/i,
        };

        // Find the line index where each section starts
        const sectionStarts: { key: SectionKey; index: number }[] = [];

        lines.forEach((line: string, idx: number) => {
            // Only consider lines that look like headers (short-ish, or start with a known keyword)
            for (const [key, regex] of Object.entries(sectionPatterns)) {
                if (regex.test(line)) {
                    // Check if it's likely a header (length, or maybe it's the only word on the line)
                    const isLikelyHeader = line.length < 50 || (line === line.toUpperCase() && line.length < 80);

                    if (isLikelyHeader) {
                        // Avoid duplicate section detections
                        if (!sectionStarts.find((s) => s.key === key)) {
                            sectionStarts.push({ key: key as SectionKey, index: idx });
                        }
                    }
                }
            }
        });

        // Sort by index
        sectionStarts.sort((a, b) => a.index - b.index);

        // Build section content blocks
        const sections: Record<SectionKey, string> = {
            summary: '',
            experience: '',
            education: '',
            skills: '',
            projects: '',
            certifications: '',
            personalProfile: '',
        };

        for (let i = 0; i < sectionStarts.length; i++) {
            const start = sectionStarts[i].index + 1; // skip the header line itself
            const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : lines.length;
            sections[sectionStarts[i].key] = lines.slice(start, end).join('\n');
        }

        // If no summary section found, try to grab text between the contact info and the first section
        if (!sections.summary && sectionStarts.length > 0) {
            const firstSectionIdx = sectionStarts[0].index;
            // Grab lines between ~line 2 (after name/contact) and the first section
            const candidateLines = lines.slice(2, firstSectionIdx).filter((l: string) =>
                !l.includes('@') && !l.includes('http') && !/^\+?\d[\d\s()-]+$/.test(l)
            );
            if (candidateLines.length > 0) {
                sections.summary = candidateLines.join(' ');
            }
        }

        // ==========================================
        // 5. Parse Experience
        // ==========================================
        const parsedExperience: { company: string; role: string; startDate: string; endDate: string; description: string }[] = [];
        if (sections.experience) {
            const expLines = sections.experience.split('\n').filter(l => l.length > 0);
            const dateRegex = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|\b\d{4})\s*(?:-|–|to)\s*(Present|Current|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|\b\d{4})/i;

            interface ExpEntry {
                role: string;
                company: string;
                startDate: string;
                endDate: string;
                descLines: string[];
            }
            let currentEntry: ExpEntry | null = null;

            for (let i = 0; i < expLines.length; i++) {
                const line = expLines[i];
                const dateMatch = line.match(dateRegex);

                if (dateMatch) {
                    if (currentEntry) parsedExperience.push({ ...currentEntry, description: currentEntry.descLines.join('\n') });

                    const roleOrCompany = line.replace(dateMatch[0], '').replace(/[|•-]/g, '').trim();
                    currentEntry = {
                        role: roleOrCompany || 'Role',
                        company: '',
                        startDate: dateMatch[1] || '',
                        endDate: dateMatch[2] || '',
                        descLines: []
                    };
                } else if (currentEntry) {
                    // Heuristic: If we have a role but no company, the first non-bullet line is the company
                    if (!currentEntry.company && line.length < 60 && !/^[•*-]/.test(line)) {
                        currentEntry.company = line;
                    } else {
                        currentEntry.descLines.push(line);
                    }
                }
            }
            if (currentEntry) parsedExperience.push({ ...currentEntry, description: currentEntry.descLines.join('\n') });
        }

        // ==========================================
        // 6. Parse Education
        // ==========================================
        const parsedEducation: { school: string; degree: string; startDate: string; endDate: string; description: string }[] = [];
        if (sections.education) {
            const eduLines = sections.education.split('\n').filter(l => l.length > 0);

            for (let i = 0; i < eduLines.length; i++) {
                const line = eduLines[i];
                const dateMatch = line.match(/(\d{4})\s*(?:-|–|to)\s*(Present|\d{4})/i);

                if (dateMatch || line.toLowerCase().includes('university') || line.toLowerCase().includes('college') || line.toLowerCase().includes('school')) {
                    const school = line.replace(/(\d{4}).*/, '').replace(/[|•-]/g, '').trim();
                    const nextLine = eduLines[i + 1] || '';

                    parsedEducation.push({
                        school: school || 'University',
                        degree: nextLine.length < 100 ? nextLine : 'Degree',
                        startDate: dateMatch ? dateMatch[1] : '',
                        endDate: dateMatch ? dateMatch[2] : '',
                        description: ''
                    });
                    if (nextLine) i++; // skip next line as it was the degree
                }
            }
        }

        // ==========================================
        // 7. Parse Projects
        // ==========================================
        const parsedProjects: { title: string; techStack: string; link: string; description: string }[] = [];
        if (sections.projects) {
            const projLines = sections.projects.split('\n').filter((l: string) => l.trim().length > 0);
            interface ProjEntry {
                title: string;
                techStack: string;
                link: string;
                descLines: string[];
            }
            let currentProject: ProjEntry | null = null;

            for (const line of projLines) {
                if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 60) {
                    if (currentProject) parsedProjects.push({ ...currentProject, description: currentProject.descLines.join('\n') });

                    // Look for tech stack in parentheses or after colon
                    let techStack = '';
                    const techMatch = line.match(/[:|(]([^)|:]+)[)|]/);
                    if (techMatch) techStack = techMatch[1].trim();

                    currentProject = {
                        title: line.replace(/[:|(].*/, '').trim(),
                        techStack: techStack,
                        link: '',
                        descLines: []
                    };
                } else if (currentProject) {
                    currentProject.descLines.push(line);
                }
            }
            if (currentProject) parsedProjects.push({ ...currentProject, description: currentProject.descLines.join('\n') });
        }

        // ==========================================
        // 8. Parse Certifications
        // ==========================================
        const parsedCerts: { name: string; issuer: string; date: string }[] = [];
        if (sections.certifications) {
            const certLines = sections.certifications.split('\n').filter(l => l.length > 0);
            certLines.forEach(line => {
                const dateMatch = line.match(/\b(20\d{2})\b/);
                const issuerMatch = line.match(/(?:by|from|at)\s+([^,|-]+)/i);

                parsedCerts.push({
                    name: line.replace(/\b(20\d{2})\b/g, '').replace(/(?:by|from|at)\s+[^,|-]+/i, '').replace(/[|•-]/g, '').trim(),
                    issuer: issuerMatch ? issuerMatch[1].trim() : 'Issuer',
                    date: dateMatch ? dateMatch[1] : ''
                });
            });
        }
        let parsedSkills = '';
        if (sections.skills) {
            // Clean up skills: remove bullets, replace newlines/pipes with commas, remove duplicates
            parsedSkills = sections.skills
                .replace(/[•*-]/g, ',') // Replace all bullets/dashes with commas
                .replace(/[|]/g, ',')   // Replace pipes with commas
                .replace(/\n/g, ', ')    // Replace newlines with commas
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 2 && !/^(skills|core\s*skills|technical\s*skills)$/i.test(s))
                .filter((v, i, a) => a.indexOf(v) === i) // Unique
                .sort((a, b) => a.localeCompare(b))      // Sort alphabetically
                .join(', ');
        }

        // ==========================================
        // 8.5 Parse Personal Profile
        // ==========================================
        const personalProfile = {
            fatherName: '',
            motherName: '',
            nationality: '',
            dateOfBirth: '',
            address: '',
            gender: '',
            maritalStatus: '',
        };

        if (sections.personalProfile) {
            const profileText = sections.personalProfile;
            // Helper to extract field while stopping at the next logical key or separator
            const extractField = (pattern: RegExp) => {
                const match = profileText.match(pattern);
                return match ? match[1]?.trim() || '' : '';
            };

            // Non-greedy lookaheads for common keys to prevent over-capturing
            const lookahead = '(?=\\s*(?:Father|Mother|Nationality|Date|DOB|Permanent|Address|Gender|Marital|Religion|\\||\\n|$))';

            personalProfile.fatherName = extractField(new RegExp(`Father['s]*\\s*Name\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.motherName = extractField(new RegExp(`Mother['s]*\\s*Name\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.nationality = extractField(new RegExp(`Nationality\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.dateOfBirth = extractField(new RegExp(`(?:Date\\s*of\\s*Birth|DOB)\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.address = extractField(new RegExp(`(?:Permanent\\s*Address|Address)\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.gender = extractField(new RegExp(`Gender\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
            personalProfile.maritalStatus = extractField(new RegExp(`Marital\\s*Status\\s*[:|-]\\s*(.*?)${lookahead}`, 'i'));
        }

        // ==========================================
        // 9. Assemble Output (matching ResumeData schema)
        // ==========================================
        const structuredData = {
            personal: {
                fullName,
                email,
                phone,
                linkedin,
                portfolio,
                summary: sections.summary.replace(/\n/g, ' ').trim(),
            },
            personalProfile,
            experience: parsedExperience,
            education: parsedEducation,
            projects: parsedProjects,
            certifications: parsedCerts,
            skills: parsedSkills,
        };

        return NextResponse.json(structuredData);
    } catch (error) {
        console.error('Structure Error:', error);
        return NextResponse.json({ error: 'Failed to structure resume' }, { status: 500 });
    }
}
