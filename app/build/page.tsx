'use client';

import { useState, useEffect } from 'react';
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

import { motion } from 'framer-motion';

export default function BuildPage() {
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on initial mount
    useEffect(() => {
        const saved = localStorage.getItem('careerops_resume_data');
        if (saved) {
            try {
                setResumeData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse resume data from local storage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('careerops_resume_data', JSON.stringify(resumeData));
        }
    }, [resumeData, isLoaded]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="flex h-[calc(100vh-64px)] overflow-hidden"
        >
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
        </motion.div>
    );
}
