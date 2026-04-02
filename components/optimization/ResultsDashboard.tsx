'use client';

import { Check, Copy, AlertTriangle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: (i: number) => ({ 
        opacity: 1, y: 0, scale: 1,
        transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
};

const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
        opacity: 1, scale: 1,
        transition: { delay: 0.3 + i * 0.03, duration: 0.25 },
    }),
};

export default function ResultsDashboard({ data }: { data: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const score = data?.matchScore || 0;
    const missing = data?.missingKeywords || [];
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);

    // Color Logic
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-500 border-green-500';
        if (s >= 50) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    const getGlow = (s: number) => {
        if (s >= 80) return 'shadow-green-500/20';
        if (s >= 50) return 'shadow-yellow-500/20';
        return 'shadow-red-500/20';
    };

    const copyFix = () => {
        if (data?.fix) {
            navigator.clipboard.writeText(data.fix);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareResults = () => {
        const text = `🚀 I just optimized my resume with CareerOps! My ATS Score is ${score}/100. Check your resume for free at: https://careerops.whoisalfaz.me`;
        navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
    };

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Top Row: Score & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <motion.div 
                    className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                >
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-4">Match Score</h3>
                    <motion.div 
                        className={`relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-4 shadow-lg mb-4 ${getColor(score)} ${getGlow(score)}`}
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                        <span className="text-4xl font-black">{score}</span>
                        <span className="text-sm font-bold opacity-50">%</span>
                    </motion.div>
                    
                    <motion.button
                        onClick={shareResults}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-primary transition-colors"
                    >
                        {shared ? <Check className="w-3 h-3 text-green-500" /> : <Share2 className="w-3 h-3" />}
                        {shared ? 'Link Copied!' : 'Share Results'}
                    </motion.button>
                </motion.div>

                {/* Feedback Card */}
                <motion.div 
                    className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Analysis</h3>
                        <motion.button 
                            onClick={async () => {
                                const text = `I just scored an ${score}% ATS Match for my upcoming role using CareerOps! 🚀\n\nSee if your resume can beat the algorithmic screener: https://careerops.whoisalfaz.me`;
                                await navigator.clipboard.writeText(text);
                                setShared(true);
                                setTimeout(() => setShared(false), 2000);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            {shared ? 'Copied!' : 'LinkedIn Share'}
                        </motion.button>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{data.feedback}</p>
                </motion.div>
            </div>

            {/* Middle Row: Missing Keywords */}
            <motion.div 
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={2}
            >
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {missing.length > 0 ? (
                        missing.map((kw: string, i: number) => (
                            <motion.span 
                                key={i} 
                                className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm"
                                variants={badgeVariants}
                                initial="hidden"
                                animate="visible"
                                custom={i}
                            >
                                {kw}
                            </motion.span>
                        ))
                    ) : (
                        <span className="text-green-500 text-sm">No critical keywords missing!</span>
                    )}
                </div>
            </motion.div>

            {/* Matched Keywords Section */}
            <motion.div 
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={3}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-green-500" />
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Detected Algorithms</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data?.matchedKeywords?.length > 0 ? (
                        data.matchedKeywords.map((kw: string, i: number) => (
                            <motion.span 
                                key={i} 
                                className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm"
                                variants={badgeVariants}
                                initial="hidden"
                                animate="visible"
                                custom={i}
                            >
                                {kw}
                            </motion.span>
                        ))
                    ) : (
                        <span className="text-red-500 text-sm">No critical keywords detected. Re-write your resume!</span>
                    )}
                </div>
            </motion.div>

            {/* Bottom Row: The Fix */}
            {data.fix && (
                <motion.div 
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Recommended Summary Fix</h3>
                        <motion.button 
                            onClick={copyFix} 
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Text'}
                        </motion.button>
                    </div>
                    <div className="p-4 bg-black rounded-lg border border-zinc-800 text-zinc-300 font-mono text-sm leading-relaxed">
                        {data.fix}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
