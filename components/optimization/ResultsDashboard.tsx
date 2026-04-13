'use client';

import { Check, Copy, AlertTriangle, Share2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
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
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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

    const shareResults = async () => {
        if (!cardRef.current) return;
        
        setIsGenerating(true);
        try {
            // Copy text payload
            const text = `🚀 I just optimized my resume with CareerOps! My ATS Score is ${score}/100.\n\nCheck your resume for free without handing over your data: https://careerops.whoisalfaz.me`;
            await navigator.clipboard.writeText(text);

            // Generate Viral Scorecard Image
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            
            // Trigger automatic download
            const link = document.createElement('a');
            link.download = `CareerOps-ATS-Score-${score}.png`;
            link.href = dataUrl;
            link.click();
            
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            console.error('Failed to generate scorecard image', err);
            // Fallback copied state
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } finally {
            setIsGenerating(false);
        }
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
                        disabled={isGenerating}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" /> : shared ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
                        {isGenerating ? 'Rendering Image...' : shared ? 'Image Saved & Copied!' : 'Download Scorecard'}
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

            {/* Hidden Shareable Viral Scorecard (Used only by html-to-image) */}
            <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
                <div 
                    ref={cardRef} 
                    className="w-[1200px] h-[630px] bg-zinc-950 flex flex-col justify-between p-16 font-sans border-t-[8px] border-emerald-500 shadow-2xl relative overflow-hidden"
                >
                    {/* Background Hackery */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-950 to-zinc-950 z-0"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-6xl font-black text-white flex items-center gap-4">
                                Career<span className="text-emerald-500">Ops</span>
                            </h1>
                            <p className="mt-4 text-2xl text-zinc-400 font-medium tracking-wide">Privacy-First ATS Optimizer</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <Check className="w-8 h-8 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-xl uppercase tracking-wider">Stateless Architecture</span>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-16 mt-8">
                        {/* Huge Score */}
                        <div className={`relative w-[320px] h-[320px] shrink-0 flex flex-col items-center justify-center rounded-full border-[12px] shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-zinc-900 ${getColor(score)} ${getGlow(score)}`}>
                            <span className="text-9xl font-black">{score}</span>
                            <span className="text-3xl font-bold opacity-60 uppercase tracking-widest mt-2 mt-4">Match</span>
                        </div>

                        {/* Stats Panel */}
                        <div className="flex-1 space-y-12 bg-zinc-900/80 p-10 rounded-3xl border border-zinc-700/50 backdrop-blur-xl shadow-2xl">
                            <div>
                                <h3 className="text-2xl text-zinc-400 uppercase tracking-widest font-semibold mb-6 flex items-center gap-3">
                                    <Check className="w-8 h-8 text-emerald-500" />
                                    Detected Keywords
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {data?.matchedKeywords?.slice(0, 6).map((kw: string, i: number) => (
                                        <span key={i} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xl font-semibold">
                                            {kw}
                                        </span>
                                    ))}
                                    {data?.matchedKeywords?.length > 6 && (
                                        <span className="text-zinc-500 text-xl font-medium px-5 py-2.5">+{data?.matchedKeywords?.length - 6} more</span>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl text-zinc-400 uppercase tracking-widest font-semibold mb-6 flex items-center gap-3">
                                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                                    Critical Missing
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {missing.length > 0 ? (
                                        missing.slice(0, 5).map((kw: string, i: number) => (
                                            <span key={i} className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-xl font-semibold">
                                                {kw}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-emerald-500 text-xl font-bold">100% Keyword Parity Achieved!</span>
                                    )}
                                    {missing.length > 5 && (
                                        <span className="text-zinc-500 text-xl font-medium px-5 py-2.5">+{missing.length - 5} more</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end border-t border-zinc-800/80 pt-8 mt-12">
                        <p className="text-xl text-zinc-500 font-medium">Algorithmic Match Verified By CareerOps Intelligence</p>
                        <p className="text-2xl text-white font-black tracking-wider flex items-center gap-3">
                            <Share2 className="w-6 h-6 text-emerald-500"/> careerops.whoisalfaz.me
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
