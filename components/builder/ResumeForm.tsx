'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Upload, Loader2, FileText, ChevronDown, ChevronUp, GraduationCap, Briefcase, Award, Code, Camera, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';


import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type ResumeData = {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    profilePhoto?: string; // base64 data URL
    personalProfile?: {
        fatherName: string;
        motherName: string;
        nationality: string;
        dateOfBirth: string;
        address: string;
        gender: string;
        maritalStatus: string;
    };
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
    const [profilePhoto, setProfilePhoto] = useState<string | undefined>(defaultValues.profilePhoto);
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
        profile: true,
        experience: true,
        education: false,
        projects: false,
        certifications: false,
        skills: true,
    });

    const toggleSection = (section: keyof typeof sectionsOpen) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

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

            // Task 2: Structure Data via JSON POST
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
                personalProfile: {
                    fatherName: n8nData.personalProfile?.fatherName || '',
                    motherName: n8nData.personalProfile?.motherName || '',
                    nationality: n8nData.personalProfile?.nationality || '',
                    dateOfBirth: n8nData.personalProfile?.dateOfBirth || '',
                    address: n8nData.personalProfile?.address || '',
                    gender: n8nData.personalProfile?.gender || '',
                    maritalStatus: n8nData.personalProfile?.maritalStatus || '',
                },
                summary: n8nData.personal?.summary || n8nData.summary || '',

                experience: Array.isArray(n8nData.experience) ? n8nData.experience.map((exp: { company?: string; role?: string; startDate?: string; endDate?: string; description?: string }) => ({
                    company: exp.company || '',
                    role: exp.role || '',
                    startDate: exp.startDate || '',
                    endDate: exp.endDate || '',
                    description: exp.description || ''
                })) : [],

                education: Array.isArray(n8nData.education) ? n8nData.education.map((edu: { school?: string; degree?: string; startDate?: string; endDate?: string; description?: string }) => ({
                    school: edu.school || '',
                    degree: edu.degree || '',
                    startDate: edu.startDate || '',
                    endDate: edu.endDate || '',
                    description: edu.description || ''
                })) : [],

                projects: Array.isArray(n8nData.projects) ? n8nData.projects.map((proj: { title?: string; techStack?: string; link?: string; description?: string }) => ({
                    title: proj.title || '',
                    techStack: proj.techStack || '',
                    link: proj.link || '',
                    description: proj.description || ''
                })) : [],

                certifications: Array.isArray(n8nData.certifications) ? n8nData.certifications.map((cert: { name?: string; issuer?: string; date?: string }) => ({
                    name: cert.name || '',
                    issuer: cert.issuer || '',
                    date: cert.date || ''
                })) : [],

                skills: n8nData.skills || ''
            };

            // Reset form with mapped data
            reset(mappedData);
            onChange(mappedData);

        } catch (error) {
            console.error("Import Error:", error);
            alert(`Failed to import resume. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Photo must be under 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setProfilePhoto(dataUrl);
            const currentData = watch();
            onChange({ ...currentData, profilePhoto: dataUrl });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removePhoto = () => {
        setProfilePhoto(undefined);
        const currentData = watch();
        onChange({ ...currentData, profilePhoto: undefined });
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

            {/* Profile Photo Upload */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Profile Photo
                </h3>
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden group">
                        {profilePhoto ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </>
                        ) : (
                            <Camera className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        <label
                            htmlFor="photo-upload"
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Upload className="w-3 h-3" />
                            {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <p className="mt-1 text-[10px] text-muted-foreground">JPG, PNG. Max 2MB. Shows in PDF export.</p>
                    </div>
                </div>
            </div>

            <form onChange={() => onChange({ ...watch(), profilePhoto })} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Personal Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input {...register('fullName')} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input {...register('email')} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input {...register('phone')} placeholder="+1 234 567 890" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn</label>
                            <Input {...register('linkedin')} placeholder="linkedin.com/in/john" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium">Portfolio</label>
                            <Input {...register('portfolio')} placeholder="whoisalfaz.me" />
                        </div>
                    </div>
                </div>

                {/* Personal Profile Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('profile')}>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Personal Profile
                        </h3>
                        {sectionsOpen.profile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {sectionsOpen.profile && (
                        <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-lg border bg-card/50">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Father&apos;s Name</label>
                                <Input {...register('personalProfile.fatherName')} placeholder="Father's Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Mother&apos;s Name</label>
                                <Input {...register('personalProfile.motherName')} placeholder="Mother's Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Nationality</label>
                                <Input {...register('personalProfile.nationality')} placeholder="Bangladeshi" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Date of Birth</label>
                                <Input {...register('personalProfile.dateOfBirth')} placeholder="May 16, 1997" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Gender</label>
                                <Input {...register('personalProfile.gender')} placeholder="Male" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Marital Status</label>
                                <Input {...register('personalProfile.maritalStatus')} placeholder="Single" />
                            </div>
                            <div className="space-y-1 sm:col-span-3">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Permanent Address</label>
                                <Input {...register('personalProfile.address')} placeholder="Full Address" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Professional Summary</label>
                    <Textarea {...register('summary')} placeholder="Driven developer with 5+ years of experience..." />
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
                                                <Input {...register(`experience.${index}.company`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Role</label>
                                                <Input {...register(`experience.${index}.role`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Start Date</label>
                                                <Input {...register(`experience.${index}.startDate`)} placeholder="Jan 2023" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">End Date</label>
                                                <Input {...register(`experience.${index}.endDate`)} placeholder="Present" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <Textarea {...register(`experience.${index}.description`)} />
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
                                                <Input {...register(`education.${index}.school`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Degree</label>
                                                <Input {...register(`education.${index}.degree`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Start Year</label>
                                                <Input {...register(`education.${index}.startDate`)} placeholder="2020" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">End Year</label>
                                                <Input {...register(`education.${index}.endDate`)} placeholder="2024" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <Textarea {...register(`education.${index}.description`)} />
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
                                                <Input {...register(`projects.${index}.title`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Tech Stack</label>
                                                <Input {...register(`projects.${index}.techStack`)} placeholder="React, Node.js" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Link</label>
                                                <Input {...register(`projects.${index}.link`)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                            <Textarea {...register(`projects.${index}.description`)} />
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
                                                <Input {...register(`certifications.${index}.name`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Issuer</label>
                                                <Input {...register(`certifications.${index}.issuer`)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium uppercase text-muted-foreground">Date</label>
                                                <Input {...register(`certifications.${index}.date`)} placeholder="2023" />
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
                        <Textarea
                            {...register('skills')}
                            placeholder="React, TypeScript, Next.js, Node.js..."
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
