'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/optimization/FileUpload';
import { ResultsDashboard } from '@/components/optimization/ResultsDashboard';
import { useOptimization } from '@/hooks/useOptimization';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function OptimizePage() {
    const [resumeText, setResumeText] = useState<string | null>(null);
    const [jdText, setJdText] = useState('');
    const { isLoading, result, runOptimization } = useOptimization();

    const handleRun = () => {
        if (resumeText && jdText) {
            runOptimization(resumeText, jdText);
        }
    };

    const isReady = !!resumeText && !!jdText && !isLoading;

    return (
        <div className="container min-h-screen py-10 px-4 md:px-6">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">Career Strategist</h1>
                <p className="text-muted-foreground">Upload your resume and the job description to identify gaps.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: Input */}
                <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            1. Upload Resume
                        </h2>
                        <FileUpload onFileParsed={setResumeText} />
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            2. Job Description
                        </h2>
                        <textarea
                            className="min-h-[200px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Paste the Job Description here..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />
                    </section>

                    <button
                        onClick={handleRun}
                        disabled={!isReady}
                        className={cn(
                            "w-full inline-flex h-12 items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                            // Primary White Glow Button Style
                            "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
                            !isReady && "opacity-50 cursor-not-allowed shadow-none bg-muted text-muted-foreground"
                        )}
                    >
                        {isLoading ? (
                            "Analyzing..."
                        ) : (
                            <>
                                Run Gap Analysis <Sparkles className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Output */}
                <div className="lg:pl-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        Analysis Results
                    </h2>
                    <ResultsDashboard isLoading={isLoading} result={result} />
                </div>
            </div>
        </div>
    );
}
