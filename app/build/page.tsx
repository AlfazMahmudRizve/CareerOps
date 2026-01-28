'use client';

import { useState } from 'react';
import { ResumeForm, type ResumeData } from '@/components/builder/ResumeForm';
import dynamic from 'next/dynamic';

// Dynamically import Preview to avoid SSR issues with @react-pdf/renderer
const ResumePreview = dynamic(
    () => import('@/components/builder/ResumePreview').then((mod) => mod.ResumePreview),
    { ssr: false, loading: () => <div className="flex h-full items-center justify-center p-8">Initializing Preview Engine...</div> }
);

const initialData: ResumeData = {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    summary: '',
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    skills: '',
};

export default function BuildPage() {
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Panel: Form Editor */}
            <div className="w-1/2 overflow-y-auto border-r border-border bg-background">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Resume Editor</h1>
                    <ResumeForm
                        defaultValues={initialData}
                        onChange={(data) => setResumeData(data)}
                    />
                </div>
            </div>

            {/* Right Panel: Live Preview */}
            <div className="w-1/2 bg-muted/50">
                <ResumePreview data={resumeData} />
            </div>
        </div>
    );
}
