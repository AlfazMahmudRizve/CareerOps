'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/optimization/FileUpload';
import ResultsDashboard from '@/components/optimization/ResultsDashboard';
import { useOptimization } from '@/hooks/useOptimization';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';
import { parsePdfFile } from '@/lib/pdf-parser';
import type { TopGradeTailoredPayload } from '@/lib/tailor/top-grade';

const TailorWorkspaceModal = dynamic(
    () => import('@/components/optimization/TailorWorkspaceModal').then((mod) => mod.TailorWorkspaceModal),
    { ssr: false }
);

export default function OptimizePage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState('');
    const { isLoading, result, runOptimization } = useOptimization();
    const [processingState, setProcessingState] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // AI Tailor State
    const [isTailorOpen, setIsTailorOpen] = useState(false);
    const [isTailoring, setIsTailoring] = useState(false);
    const [tailoredData, setTailoredData] = useState<TopGradeTailoredPayload | null>(null);

    const jdWordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;

    const handleTailor = async () => {
        if (!resumeFile || !jdText) return;
        setIsTailorOpen(true);
        setIsTailoring(true);
        setErrorMsg(null);

        try {
            const resumeText = await parsePdfFile(resumeFile);
            const res = await fetch('/api/tailor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jdText,
                    missingKeywords: result?.missingKeywords || [],
                }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.error || 'Tailoring failed');
            }

            const tailored = await res.json();
            setTailoredData(tailored);
        } catch (err) {
            console.error(err);
            setErrorMsg(`Tailoring Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsTailoring(false);
        }
    };

    const handleRun = async () => {
        if (!resumeFile || !jdText) return;
        setErrorMsg(null);

        try {
            setProcessingState('Extracting PDF text...');
            const resumeText = await parsePdfFile(resumeFile);

            if (!resumeText || resumeText.trim().length === 0) {
                setErrorMsg('Failed to extract text from PDF. The PDF may be scanned as an image or empty.');
                return;
            }

            // Stage 2: Algorithm Delay & Analysis
            setProcessingState('Extracting syntax structure...');
            await new Promise(resolve => setTimeout(resolve, 600));
            
            setProcessingState('Cross-referencing JD vectors...');
            await new Promise(resolve => setTimeout(resolve, 800));

            await runOptimization(resumeText, jdText);
            setProcessingState('');

        } catch (error) {
            console.error(error);
            setErrorMsg(`Error processing request: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const isReady = !!resumeFile && !!jdText && !isLoading;

    return (
        <div className="container min-h-screen py-10 px-4 md:px-6">
            <header className="mb-10 border-b border-border/50 pb-6 text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60"
                >
                    Career Strategist Dashboard
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground mt-2"
                >
                    Upload your resume and the job description to identify bypass vectors.
                </motion.p>
            </header>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: Input */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    {/* Glassmorphic glow effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    
                    {errorMsg && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                            <span>{errorMsg}</span>
                            <button onClick={() => setErrorMsg(null)} className="text-red-400 font-bold hover:text-white ml-2">✕</button>
                        </div>
                    )}

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            1. Upload Resume
                        </h2>
                        <FileUpload onFileSelect={setResumeFile} />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                2. Job Description
                            </h2>
                            {jdText && (
                                <span className={cn("text-xs font-mono", jdWordCount < 20 ? "text-amber-400" : "text-zinc-500")}>
                                    {jdWordCount} words {jdWordCount < 20 ? "(min 20 recommended)" : ""}
                                </span>
                            )}
                        </div>
                        <textarea
                            className="min-h-[200px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Paste the Job Description here..."
                            value={jdText}
                            onChange={(e) => {
                                setJdText(e.target.value);
                                if (errorMsg) setErrorMsg(null);
                            }}
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
                </motion.div>

                {/* Right Column: Output */}
                <div className="lg:pl-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        {isLoading || result ? "Intelligence Report" : "Awaiting Data..."}
                    </h2>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center p-16 space-y-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 relative overflow-hidden"
                            >
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <div className="space-y-2 text-center z-10">
                                    <p className="text-sm font-mono text-primary animate-pulse">{processingState || 'Initializing Extractor...'}</p>
                                    <p className="text-xs text-muted-foreground">Bypassing algorithmic filters</p>
                                </div>
                                {/* Background grid for hacker feel */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                            </motion.div>
                        ) : result ? (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ResultsDashboard data={result} onTailor={handleTailor} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[400px] rounded-2xl border border-dashed border-zinc-800 flex items-center justify-center flex-col text-zinc-600 gap-4"
                            >
                                <FileSearch className="w-12 h-12 opacity-50" />
                                <p>Upload documents to generate the report.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Top-Grade AI Tailor Side-by-Side Review Workspace Modal */}
            <TailorWorkspaceModal
                isOpen={isTailorOpen}
                onClose={() => setIsTailorOpen(false)}
                data={tailoredData}
                isLoading={isTailoring}
                originalScore={result?.matchScore}
            />
        </div>
    );
}
