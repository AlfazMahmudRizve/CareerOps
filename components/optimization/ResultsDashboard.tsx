'use client';

import { Check, Copy, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ResultsDashboard({ data }: { data: any }) {
    const score = data?.matchScore || 0;
    const missing = data?.missingKeywords || [];
    const [copied, setCopied] = useState(false);

    // Color Logic
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-500 border-green-500';
        if (s >= 50) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    const copyFix = () => {
        if (data?.fix) {
            navigator.clipboard.writeText(data.fix);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Row: Score & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center">
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-4">Match Score</h3>
                    <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${getColor(score)}`}>
                        <span className="text-4xl font-bold text-white">{score}%</span>
                    </div>
                </div>
                {/* Feedback Card */}
                <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Analysis</h3>
                    <p className="text-zinc-300 leading-relaxed">{data.feedback}</p>
                </div>
            </div>

            {/* Middle Row: Missing Keywords */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {missing.length > 0 ? (
                        missing.map((kw: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm">
                                {kw}
                            </span>
                        ))
                    ) : (
                        <span className="text-green-500 text-sm">No critical keywords missing!</span>
                    )}
                </div>
            </div>

            {/* Bottom Row: The Fix */}
            {data.fix && (
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Recommended Summary Fix</h3>
                        <button onClick={copyFix} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800 text-zinc-300 font-mono text-sm leading-relaxed">
                        {data.fix}
                    </div>
                </div>
            )}
        </div>
    );
}
