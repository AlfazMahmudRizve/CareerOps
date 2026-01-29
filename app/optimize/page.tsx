'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/optimization/FileUpload';
import ResultsDashboard from '@/components/optimization/ResultsDashboard';
import { useOptimization } from '@/hooks/useOptimization';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function OptimizePage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState('');
    const { isLoading, result, runOptimization } = useOptimization();

    const handleRun = async () => {
        if (!resumeFile || !jdText) return;

        // Stage 1: Extraction
        try {
            const formData = new FormData();
            formData.append('file', resumeFile);

            // We need to handle loading state manually here or extend the hook
            // For simplicity, let's assume runOptimization handles the loading UI for the WHOLE process if we pass it the file?
            // The prompt says: "Refactor handleAnalyze... Stage 1... Stage 2..."
            // But runOptimization hook currently does the Fetch to /api/analyze.
            // I should probably modify runOptimization to accept TEXT, and do extraction HERE.

            // Let's modify the loading state management to wrap this whole process.
            // Actually, I can't access setIsLoading from the hook if it doesn't export it.
            // Oh, the hook exports isLoading. But I can't SET it.
            // I will implement the logic inside this component for the parser, then call runOptimization with text.
            // But runOptimization sets loading.

            // Wait, to show loading during parsing, I need local state or modifying the hook.
            // Let's modify the hook later if needed, but for now:

            const parseResponse = await fetch('/api/parse-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!parseResponse.ok) {
                const contentType = parseResponse.headers.get("content-type");
                let errorMessage = 'Unknown server error';

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await parseResponse.json();
                    errorMessage = errorData.error;
                } else {
                    errorMessage = `Server returned ${parseResponse.status} ${parseResponse.statusText}`;
                    const text = await parseResponse.text();
                    console.error('Server Error Text:', text);
                }

                alert(`Failed to parse PDF: ${errorMessage}`);
                return;
            }

            const parseData = await parseResponse.json();
            const resumeText = parseData.text;

            // Stage 2: Analysis
            await runOptimization(resumeText, jdText);

        } catch (error) {
            console.error(error);
            alert(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const isReady = !!resumeFile && !!jdText && !isLoading;

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
                        <FileUpload onFileSelect={setResumeFile} />
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

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground animate-pulse">Analyzing your resume...</p>
                        </div>
                    ) : (
                        <ResultsDashboard data={result} />
                    )}
                </div>
            </div>
        </div>
    );
}
