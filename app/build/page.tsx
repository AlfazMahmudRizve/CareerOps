'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResumeForm, type ResumeData } from '@/components/builder/ResumeForm';
import { ROLE_DATA } from '@/lib/role-data';
import { Sparkles, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

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

function BuildContent() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);
    const [isLoaded, setIsLoaded] = useState(false);
    const [appliedRole, setAppliedRole] = useState<string | null>(null);

    // Load from local storage on initial mount OR hydrate from template
    useEffect(() => {
        const saved = localStorage.getItem('careerops_resume_data');
        const roleData = roleParam ? ROLE_DATA[roleParam as keyof typeof ROLE_DATA] : null;

        if (roleData && !saved) {
            // Apply template if no existing data
            setResumeData({
                ...initialData,
                fullName: 'Alfaz Mahmud Rizve', // Default placeholder for virality
                summary: roleData.summary,
                skills: roleData.skills,
            });
            setAppliedRole(roleData.title);
        } else if (saved) {
            try {
                setResumeData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse resume data from local storage", e);
            }
        }
        setIsLoaded(true);
    }, [roleParam]);

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
            <div className="w-1/2 overflow-y-auto border-r border-border bg-background relative">
                <AnimatePresence>
                    {appliedRole && (
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="absolute top-4 right-4 z-50 bg-primary/10 border border-primary/20 p-3 rounded-xl backdrop-blur-md flex items-center gap-3 shadow-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Template Applied</p>
                                <p className="text-xs font-semibold">{appliedRole} optimization active.</p>
                            </div>
                            <button 
                                onClick={() => setAppliedRole(null)}
                                className="ml-2 hover:bg-primary/5 rounded-full p-1 group"
                            >
                                <Info size={14} className="text-primary opacity-50 group-hover:opacity-100" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Resume Editor</h1>
                    </div>

                    <ResumeForm
                        defaultValues={resumeData}
                        key={`${isLoaded}-${roleParam || 'default'}`}
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

export default function BuildPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center font-mono text-primary animate-pulse">Initializing Environment...</div>}>
            <BuildContent />
        </Suspense>
    );
}
