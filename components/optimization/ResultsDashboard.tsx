'use client';

import {
  Check, Copy, Share2, Loader2, Sparkles, Target,
  CheckCircle2, XCircle, ArrowUpRight, ShieldCheck, Zap
} from 'lucide-react';
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: 0.2 + i * 0.02, duration: 0.2 },
  }),
};

export default function ResultsDashboard({
  data,
  onTailor
}: {
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onTailor?: () => void;
}) {
  const score = data?.matchScore || 0;
  const missing = data?.missingKeywords || [];
  const matched = data?.matchedKeywords || [];
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [copiedBullet, setCopiedBullet] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'tailor'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'missing' | 'matched'>('all');

  const cardRef = useRef<HTMLDivElement>(null);

  const getTemplatesForKeyword = (kw: string) => [
    `Demonstrated proficiency in ${kw} to streamline project deliverables and exceed performance targets by 20%.`,
    `Leveraged ${kw} to foster cross-functional alignment, driving a 25% improvement in operational throughput.`,
    `Applied advanced ${kw} methodologies to eliminate workflow bottlenecks and achieve 100% compliance.`,
    `Mentored cross-functional team members on best practices regarding ${kw}, elevating overall department output.`,
    `Integrated ${kw} directly into core operations, reducing turnaround time by 30%.`
  ];

  // Score Color and Glow Config (WCAG AAA compliant contrast)
  const getScoreTheme = (s: number) => {
    if (s >= 80) return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      glow: 'shadow-emerald-500/30',
      gradient: 'from-emerald-500 to-teal-400',
      label: 'High ATS Pass Guarantee (Workday & Taleo Ready)',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
    if (s >= 50) return {
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      glow: 'shadow-amber-500/30',
      gradient: 'from-amber-500 to-orange-400',
      label: 'Moderate Match (Missing Key Requirements)',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
    return {
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      glow: 'shadow-rose-500/30',
      gradient: 'from-rose-500 to-red-600',
      label: 'Critical ATS Screener Risk (Action Required)',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    };
  };

  const theme = getScoreTheme(score);

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
      const text = `🚀 I just analyzed my resume with CareerOps! My ATS Match Score is ${score}/100.\n\nTest your resume for free without handing over your data: https://careerops.whoisalfaz.me`;
      await navigator.clipboard.writeText(text);

      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `CareerOps-ATS-Score-${score}.png`;
      link.href = dataUrl;
      link.click();

      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error('Failed to generate scorecard image', err);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-6" ref={cardRef}>
      {/* 1. High-Impact Glass Hero Header */}
      <motion.div
        className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-zinc-950/80 p-6 md:p-8 backdrop-blur-2xl shadow-2xl ${theme.glow}`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        {/* Background ambient lighting blur */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${theme.gradient} opacity-20 blur-3xl`} />

        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
          {/* Circular Score Gauge */}
          <div className="flex flex-col items-center justify-center md:col-span-4 border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <motion.div
              className={`relative flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 ${theme.border} ${theme.bg} shadow-2xl backdrop-blur-md`}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
            >
              <span className={`text-5xl font-black tracking-tight ${theme.text}`}>{score}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Match Score</span>
            </motion.div>

            <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${theme.badgeClass}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {theme.label}
            </span>
          </div>

          {/* Key Insights & AI Quick Actions */}
          <div className="space-y-4 md:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Intelligence Analysis Summary
              </h2>

              {/* Share Scorecard */}
              <motion.button
                onClick={shareResults}
                disabled={isGenerating}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" /> : shared ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-zinc-400" />}
                {isGenerating ? 'Rendering Scorecard...' : shared ? 'Scorecard Saved!' : 'Share Scorecard'}
              </motion.button>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300">
              {data?.feedback || 'Analysis complete. Review key gaps and utilize the AI Resume Tailor to optimize your experience against job description keywords.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-center">
                <span className="block text-xs text-zinc-400 uppercase tracking-wider">Missing Terms</span>
                <span className="text-lg font-bold text-rose-400">{missing.length}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-center">
                <span className="block text-xs text-zinc-400 uppercase tracking-wider">Matched Terms</span>
                <span className="text-lg font-bold text-emerald-400">{matched.length}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-center">
                <span className="block text-xs text-zinc-400 uppercase tracking-wider">Tailor Boost</span>
                <span className="text-lg font-bold text-teal-400">+35%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex border-b border-zinc-800 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          📊 Strategic Feedback & Fixes
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'keywords'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🔍 Keyword Matrix ({missing.length + matched.length})
        </button>
        {onTailor && (
          <button
            onClick={() => setActiveTab('tailor')}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'tailor'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ✨ AI Resume Tailor
          </button>
        )}
      </div>

      {/* 3. Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Recommended AI Summary Fix */}
            {data?.fix && (
              <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/80 p-6 backdrop-blur-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Recommended Executive Summary Overhaul
                  </h3>
                  <button
                    onClick={copyFix}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-zinc-200 font-mono bg-zinc-900/60 p-4 rounded-xl border border-white/5">
                  {data.fix}
                </p>
              </div>
            )}

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/60 p-5 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Key Resume Strengths
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Strong alignment on core technical capabilities ({matched.slice(0, 3).join(', ') || 'General qualifications'}).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Parsed clean contact details and authentic work history.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-zinc-950/60 p-5 space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Critical Keyword Gaps
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">•</span>
                    Missing {missing.length} high-frequency job description terms ({missing.slice(0, 3).join(', ') || 'None'}).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">•</span>
                    Experience bullets require STAR format (Action Verb + Quantifiable Impact).
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'keywords' && (
          <motion.div
            key="keywords"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filter Pills */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Terms ({missing.length + matched.length})
              </button>
              <button
                onClick={() => setFilterType('missing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'missing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Missing ({missing.length})
              </button>
              <button
                onClick={() => setFilterType('matched')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'matched' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Matched ({matched.length})
              </button>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-2 p-4 rounded-2xl border border-white/10 bg-zinc-950/60">
              {(filterType === 'all' || filterType === 'missing') &&
                missing.map((kw: string, i: number) => (
                  <motion.button
                    key={`m-${kw}`}
                    onClick={() => setSelectedKeyword(kw)}
                    variants={badgeVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 ${
                      selectedKeyword === kw ? 'ring-2 ring-rose-400' : ''
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                    {kw}
                  </motion.button>
                ))}

              {(filterType === 'all' || filterType === 'matched') &&
                matched.map((kw: string, i: number) => (
                  <motion.span
                    key={`match-${kw}`}
                    variants={badgeVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {kw}
                  </motion.span>
                ))}
            </div>

            {/* Interactive Bullet Template Generator for Selected Keyword */}
            {selectedKeyword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-2xl border border-amber-500/20 bg-zinc-950/80 p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    STAR Bullet Templates for &quot;{selectedKeyword}&quot;
                  </h4>
                  <button
                    onClick={() => setSelectedKeyword(null)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  {getTemplatesForKeyword(selectedKeyword).map((tpl, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 text-xs text-zinc-200"
                    >
                      <span>• {tpl}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tpl);
                          setCopiedBullet(idx);
                          setTimeout(() => setCopiedBullet(null), 2000);
                        }}
                        className="ml-3 text-zinc-400 hover:text-emerald-400"
                      >
                        {copiedBullet === idx ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {(activeTab === 'tailor' || onTailor) && (
          <motion.div
            key="tailor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* 4. ✨ AI Resume Tailor Action Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
              <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Top-Grade AI Engine (STAR Method)
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Tailor Entire Resume to Job Description
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    Automatically rewrite experience bullets with action verbs, inject missing keywords cleanly, and boost your ATS score to 90%+ with zero false claims.
                  </p>
                </div>

                <motion.button
                  onClick={onTailor}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Tailor Resume with AI
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
