'use client';

import { Upload, FileSearch, Sparkles, FileCheck } from 'lucide-react';

const steps = [
    {
        icon: Upload,
        title: 'Upload Resume',
        description: 'Drag & drop your PDF. We parse it locally—your data never leaves your browser.',
    },
    {
        icon: FileSearch,
        title: 'Paste JD',
        description: 'Copy the job description you are targeting. We identify key requirements.',
    },
    {
        icon: Sparkles,
        title: 'AI Analysis',
        description: 'Our stateless agent identifies gaps, missing keywords, and structural issues.',
    },
    {
        icon: FileCheck,
        title: 'Get Insights',
        description: 'Receive an instant match score and a checklist of actionable improvements.',
    },
];

export function HowItWorks() {
    return (
        <section className="container py-24 md:py-32 px-4 md:px-6 border-t border-border/40">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    How CareerOps Works
                </h2>
                <p className="mt-4 text-muted-foreground max-w-[600px] mx-auto">
                    A simple, four-step process to double your interview chances without risking your privacy.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <step.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
