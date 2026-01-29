'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Upload, Loader2, FileText, ChevronDown, ChevronUp, GraduationCap, Briefcase, Award, Code } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';


export type ResumeData = {
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
    certifications: {
        name: string;
        issuer: string;
        date: string;
    }[];
    skills: string;
};

interface ResumeFormProps {
    defaultValues: ResumeData;
    onChange: (data: ResumeData) => void;
}

export function ResumeForm({ defaultValues, onChange }: ResumeFormProps) {
    const [isImporting, setIsImporting] = useState(false);
    const { register, control, watch, reset } = useForm<ResumeData>({
        defaultValues,
    });

    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
        control,
        name: 'experience',
    });

    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
        control,
        name: 'education',
    });

    const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
        control,
        name: 'projects',
    });

    const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
        control,
        name: 'certifications',
    });

    // Collapsible State
    const [sectionsOpen, setSectionsOpen] = useState({
        personal: true,
        experience: true,
        education: false,
        projects: false,
        certifications: false,
        skills: true,
    });

    const toggleSection = (section: keyof typeof sectionsOpen) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Watch for changes and propagate up
    // In a real app, we might use debouncing here


    // Effect to trigger onChange when formValues change could be implemented, 
    // but for performance, we might just pass the `watch` result or control to the parent
    // However, specifically for the preview to need real-time updates:
    // We can use a useEffect on the parent or just let the parent control the state.
    // For this "Split Screen", commonly the parent holds state.
    // But react-hook-form is uncontrolled by default.
    // Let's assume the parent passes a handler that we call on change.
    // Or simpler: The parent renders this Form and the Preview. 
    // The Form notifies parent on Change.

    // A simple way to sync is to use `useEffect` to call onChange(formValues)
    // whenever formValues changes. 

    // For now, let's implement the 'Import' logic.

    const handleSmartImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            // Task 1: Extract Text via API
            const formData = new FormData();
            formData.append('file', file);

            const parseResponse = await fetch('/api/parse-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) throw new Error('Failed to parse PDF');

            const parseData = await parseResponse.json();
            const pdfText = parseData.text;

            // Task 2: Structure Data via n8n Proxy
            const structureResponse = await fetch('/api/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: pdfText }),
            });

            if (!structureResponse.ok) throw new Error('Failed to structure resume data');

            const n8nData = await structureResponse.json();
            console.log("Structured Data:", n8nData);

            // Task 3: Map Data to Form Schema
            // Safety: Use optional chaining and defaults
            const mappedData: ResumeData = {
                fullName: n8nData.personal?.fullName || n8nData.fullName || '',
                email: n8nData.personal?.email || n8nData.email || '',
                phone: n8nData.personal?.phone || n8nData.phone || '',
                linkedin: n8nData.personal?.linkedin || n8nData.linkedin || '',
                portfolio: n8nData.personal?.portfolio || n8nData.portfolio || '',
                summary: n8nData.personal?.summary || n8nData.summary || '',

                experience: Array.isArray(n8nData.experience) ? n8nData.experience.map((exp: any) => ({
                    company: exp.company || '',
                    role: exp.role || '',
                    startDate: exp.startDate || '',
                    endDate: exp.endDate || '',
                    description: exp.description || ''
                })) : [],

                education: Array.isArray(n8nData.education) ? n8nData.education.map((edu: any) => ({
                    school: edu.school || '',
                    degree: edu.degree || '',
                    startDate: edu.startDate || '',
                    endDate: edu.endDate || '',
                    description: edu.description || ''
                })) : [],

                projects: Array.isArray(n8nData.projects) ? n8nData.projects.map((proj: any) => ({
                    title: proj.title || '',
                    techStack: proj.techStack || '',
                    link: proj.link || '',
                    description: proj.description || ''
                })) : [],

                certifications: Array.isArray(n8nData.certifications) ? n8nData.certifications.map((cert: any) => ({
                    name: cert.name || '',
                    issuer: cert.issuer || '',
                    date: cert.date || ''
                })) : [],

                skills: n8nData.skills || ''
            };

            // Reset form with mapped data
            reset(mappedData);
            onChange(mappedData);

            // alert('Import Complete!'); // Optional: Replace with toast if available

        } catch (error) {
            console.error("Import Error:", error);
            alert(`Failed to import resume. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-8 p-6 pb-24">
            {/* Import Section */}
            <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleSmartImport}
                />
                <label
                    htmlFor="resume-upload"
                    className={cn(
                        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-800 border border-input",
                        isImporting && "opacity-50 pointer-events-none"
                    )}
                >
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isImporting ? 'Parsing...' : 'Smart Import from PDF'}
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                    Upload your existing resume to auto-fill these fields.
                </p>
            </div>

            <form onChange={() => onChange(watch())} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Personal Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                {...register('fullName')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                {...register('email')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input
                                {...register('phone')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn</label>
                            <input
                                {...register('linkedin')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="linkedin.com/in/john"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium">Portfolio</label>
                            <input
                                {...register('portfolio')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="whoisalfaz.me"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Professional Summary</label>
                        <textarea
                            {...register('summary')}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Driven developer with 5+ years of experience..."
                        />
                    </div>
                </div>

                {/* Experience */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('experience')}>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Experience
                        </h3>
                        <div className="flex items-center gap-2">
                            {sectionsOpen.experience ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </div>

                    {sectionsOpen.experience && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => appendExperience({ company: '', role: '', startDate: '', endDate: '', description: '' })}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {experienceFields.map((field, index) => (
                                    <div key={field.id} className="relative rounded-lg border bg-card p-4 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(index)}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Company</label>
                                                <input
                                                    {...register(`experience.${index}.company`)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Role</label>
                                                <input
                                                    {...register(`experience.${index}.role`)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Start Date</label>
                                                <input
                                                    {...register(`experience.${index}.startDate`)}
                                                    placeholder="Jan 2023"
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">End Date</label>
                                                <input
                                                    {...register(`experience.${index}.endDate`)}
                                                    placeholder="Present"
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <textarea
                                                {...register(`experience.${index}.description`)}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Education */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('education')}>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Education
                        </h3>
                        <div className="flex items-center gap-2">
                            {sectionsOpen.education ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </div>

                    {sectionsOpen.education && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => appendEducation({ school: '', degree: '', startDate: '', endDate: '', description: '' })}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {educationFields.map((field, index) => (
                                    <div key={field.id} className="relative rounded-lg border bg-card p-4 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(index)}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">School</label>
                                                <input {...register(`education.${index}.school`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Degree</label>
                                                <input {...register(`education.${index}.degree`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Start Year</label>
                                                <input {...register(`education.${index}.startDate`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" placeholder="2020" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">End Year</label>
                                                <input {...register(`education.${index}.endDate`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" placeholder="2024" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <textarea {...register(`education.${index}.description`)} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Projects */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('projects')}>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Code className="h-4 w-4" /> Projects
                        </h3>
                        <div className="flex items-center gap-2">
                            {sectionsOpen.projects ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </div>

                    {sectionsOpen.projects && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => appendProject({ title: '', techStack: '', link: '', description: '' })}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {projectFields.map((field, index) => (
                                    <div key={field.id} className="relative rounded-lg border bg-card p-4 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeProject(index)}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Title</label>
                                                <input {...register(`projects.${index}.title`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Tech Stack</label>
                                                <input {...register(`projects.${index}.techStack`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" placeholder="React, Node.js" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Link</label>
                                                <input {...register(`projects.${index}.link`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <textarea {...register(`projects.${index}.description`)} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('certifications')}>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4" /> Certifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {sectionsOpen.certifications ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </div>

                    {sectionsOpen.certifications && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => appendCert({ name: '', issuer: '', date: '' })}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {certFields.map((field, index) => (
                                    <div key={field.id} className="relative rounded-lg border bg-card p-4 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => removeCert(index)}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Name</label>
                                                <input {...register(`certifications.${index}.name`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Issuer</label>
                                                <input {...register(`certifications.${index}.issuer`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Date</label>
                                                <input {...register(`certifications.${index}.date`)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" placeholder="2023" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Comma separated list</label>
                        <textarea
                            {...register('skills')}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="React, TypeScript, Next.js, Node.js..."
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
