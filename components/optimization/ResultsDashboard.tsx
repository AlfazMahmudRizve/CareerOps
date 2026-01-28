import { useState } from 'react';
import { Download, CheckCircle, XCircle, FileText, PieChart, ListChecks } from 'lucide-react';
import { type OptimizationResult } from '@/hooks/useOptimization';
import { cn } from '@/lib/utils';
import { TerminalLoader } from '@/components/optimization/TerminalLoader';

interface ResultsDashboardProps {
    isLoading: boolean;
    result: OptimizationResult | null;
}

type Tab = 'match' | 'analysis' | 'ats';

export function ResultsDashboard({ isLoading, result }: ResultsDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('match');

    if (isLoading) {
        return <TerminalLoader />;
    }

    // Helper for determining score color
    const getScoreColor = (score: number) => {
        if (score > 70) return 'text-green-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    if (!result) {
        // Smart Skeleton Empty State
        return (
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
                {/* Blurred Skeleton Content */}
                <div className="absolute inset-0 z-0 p-6 opacity-30 blur-sm pointer-events-none select-none">
                    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-32 w-32 rounded-full border-8 border-muted/20" />
                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-3 rounded-lg border bg-background/50 p-3 h-12">
                                <div className="h-5 w-5 rounded-full bg-muted/50" />
                                <div className="h-4 w-full bg-muted/50 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overlay Message */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/10 backdrop-blur-[2px]">
                    <div className="rounded-lg bg-background/80 p-6 text-center shadow-2xl border border-white/10 backdrop-blur-md max-w-md mx-4">
                        <h3 className="text-xl font-bold mb-2">Ready to analyze</h3>
                        <p className="text-muted-foreground">Upload your resume to unlock insights.</p>
                    </div>
                </div>
            </div>
        );
    }

    const scoreColor = getScoreColor(result.score);
    const gradient = `conic-gradient(currentColor ${result.score}%, transparent 0)`;

    // Mock ATS Text content
    const atsContent = `
NAME
[Your Name Here]

SUMMARY
Driven software engineer with a focus on Frontend technologies.

SKILLS
Found: Frontend Skills, React, Next.js, Tailwind CSS
Missing: ${result.missingKeywords.join(', ')}

MATCH SCORE: ${result.score}%
FEEDBACK: ${result.feedback}
  `.trim();

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex p-1 space-x-1 rounded-lg bg-muted/20 border border-white/5">
                <button
                    onClick={() => setActiveTab('match')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                        activeTab === 'match'
                            ? "bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <PieChart className="w-4 h-4" />
                    Job Match
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                        activeTab === 'analysis'
                            ? "bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <ListChecks className="w-4 h-4" />
                    Gap Analysis
                </button>
                <button
                    onClick={() => setActiveTab('ats')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                        activeTab === 'ats'
                            ? "bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <FileText className="w-4 h-4" />
                    ATS Format
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Tab 1: Job Match */}
                {activeTab === 'match' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-sm h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col items-center justify-center space-y-6 h-full py-8">
                            <h3 className="text-xl font-bold">Overall Match Score</h3>
                            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-muted/20">
                                {/* Ring */}
                                <div
                                    className={cn("absolute inset-0 rounded-full", scoreColor)}
                                    style={{
                                        background: gradient,
                                        maskImage: 'radial-gradient(transparent 60%, black 61%)',
                                        WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
                                    }}
                                />
                                <div className="relative z-10 text-5xl font-extrabold">{result.score}%</div>
                            </div>
                            <p className="text-center text-lg text-muted-foreground max-w-md">
                                {result.feedback}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tab 2: Gap Analysis */}
                {activeTab === 'analysis' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="mb-4 text-lg font-bold">Detailed Skill Analysis</h3>
                        <div className="space-y-3">
                            {result.missingKeywords.map((keyword) => (
                                <div key={keyword} className="flex items-center space-x-3 rounded-lg border border-white/5 bg-background/50 p-3">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="flex-1 font-medium">{keyword}</span>
                                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Missing</span>
                                </div>
                            ))}
                            <div className="flex items-center space-x-3 rounded-lg border border-white/5 bg-background/50 p-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="flex-1 font-medium">Frontend Skills</span>
                                <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">Found</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: ATS Format */}
                {activeTab === 'ats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="rounded-xl border border-white/10 bg-black/50 p-6 font-mono text-xs md:text-sm text-green-400/80 shadow-inner h-[300px] overflow-y-auto whitespace-pre-wrap">
                            {atsContent}
                        </div>

                        <button
                            onClick={() => {
                                const element = document.createElement("a");
                                const file = new Blob([atsContent], { type: 'text/plain' });
                                element.href = URL.createObjectURL(file);
                                element.download = "optimized-resume_ATS.txt";
                                document.body.appendChild(element);
                                element.click();
                                document.body.removeChild(element);
                            }}
                            className="w-full inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download ATS Text File
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
