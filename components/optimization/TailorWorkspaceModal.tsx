'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  X,
  CheckCircle2,
  Download,
  ExternalLink,
  TrendingUp,
  Loader2,
  FileText,
  Briefcase,
  Check,
  Zap,
  Plus,
  XCircle,
  CheckCheck,
  RotateCcw,
  Layers,
  Wand2,
} from 'lucide-react';
import type { TopGradeTailoredPayload } from '@/lib/tailor/top-grade';
import type { ResumeData } from '@/components/builder/ResumeForm';
import { ExecutiveTemplate } from '@/components/pdf/ExecutiveTemplate';
import { PDFDownloadLink } from '@react-pdf/renderer';

export interface TailorWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TopGradeTailoredPayload | null;
  isLoading: boolean;
  originalScore?: number;
}

const loadingSteps = [
  'Extracting complete candidate facts & structural sections...',
  'Mapping job description skills against experience achievements...',
  'Formatting STAR bullet points (Action + Task + Quantifiable Impact)...',
  'Injecting target ATS keywords without introducing unverified claims...',
  'Constructing side-by-side interactive strategy workspace...',
];

/**
 * Formats TopGradeTailoredPayload into ResumeData for local storage hydration and PDF export,
 * respecting bullet-level accept/reject decisions.
 */
export function formatPayloadToResumeData(
  data: TopGradeTailoredPayload,
  acceptedBulletsState: Record<string, boolean> = {}
): ResumeData {
  const fullName = data.personal?.fullName || data.fullName || '';
  const email = data.personal?.email || data.email || '';
  const phone = data.personal?.phone || data.phone || '';
  const linkedin = data.personal?.linkedin || data.linkedin || '';
  const portfolio = data.personal?.portfolio || data.portfolio || '';

  const skillsStr =
    typeof data.skills === 'string'
      ? data.skills
      : [
          ...(data.skills?.technical || []),
          ...(data.skills?.tools || []),
          ...(data.skills?.soft || []),
        ]
          .filter(Boolean)
          .join(', ');

  const experience = (data.experience || []).map((exp, expIdx) => {
    const finalBullets = (exp.bullets || []).map((b, bulletIdx) => {
      const key = `${expIdx}-${bulletIdx}`;
      const isAccepted = acceptedBulletsState[key] !== false; // default true
      if (isAccepted) {
        return b;
      }
      return exp.originalBullets?.[bulletIdx] || b;
    });

    const description = finalBullets
      .map((b) => (b.trim().startsWith('•') ? b.trim() : `• ${b.trim()}`))
      .join('\n');

    return {
      company: exp.company || '',
      role: exp.role || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: description || exp.description || '',
    };
  });

  const education = (data.education || []).map((edu) => ({
    school: edu.school || '',
    degree: edu.degree || '',
    startDate: edu.startDate || '',
    endDate: edu.endDate || '',
    description: edu.details || edu.description || '',
  }));

  const projects = (data.projects || []).map((proj) => {
    const description = (proj.bullets || [])
      .map((b) => (b.trim().startsWith('•') ? b.trim() : `• ${b.trim()}`))
      .join('\n');
    return {
      title: proj.title || '',
      techStack: proj.techStack || '',
      link: proj.link || '',
      description: description || proj.description || '',
    };
  });

  return {
    fullName,
    email,
    phone,
    linkedin,
    portfolio,
    summary: data.summary || '',
    experience,
    education,
    projects,
    certifications: [],
    skills: skillsStr,
  };
}

/** Helper to extract matching injected keywords from a bullet point */
function getMatchingKeywords(
  bulletText: string,
  keywordsList: string[] = [],
  keywordMapping: { keyword: string; location: string }[] = []
): string[] {
  if (!bulletText) return [];
  const textLower = bulletText.toLowerCase();
  const matched = new Set<string>();

  // Check explicit keyword mapping
  keywordMapping.forEach((item) => {
    if (item.keyword && textLower.includes(item.keyword.toLowerCase())) {
      matched.add(item.keyword);
    }
  });

  // Check integrated keywords list
  keywordsList.forEach((kw) => {
    if (kw && textLower.includes(kw.toLowerCase())) {
      matched.add(kw);
    }
  });

  return Array.from(matched);
}

export function TailorWorkspaceModal({
  isOpen,
  onClose,
  data,
  isLoading,
  originalScore = 45,
}: TailorWorkspaceModalProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Accepted bullets state: map key `${expIdx}-${bulletIdx}` -> boolean (default true)
  const [acceptedBullets, setAcceptedBullets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize all bullets to accepted when new data arrives
  useEffect(() => {
    if (data?.experience) {
      const initialState: Record<string, boolean> = {};
      data.experience.forEach((exp, expIdx) => {
        (exp.bullets || []).forEach((_, bulletIdx) => {
          initialState[`${expIdx}-${bulletIdx}`] = true;
        });
      });
      setAcceptedBullets(initialState);
    }
  }, [data]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Loading step timer
  useEffect(() => {
    if (!isLoading) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleBullet = (key: string) => {
    setAcceptedBullets((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleAcceptAll = () => {
    if (!data?.experience) return;
    const newState: Record<string, boolean> = {};
    data.experience.forEach((exp, expIdx) => {
      (exp.bullets || []).forEach((_, bulletIdx) => {
        newState[`${expIdx}-${bulletIdx}`] = true;
      });
    });
    setAcceptedBullets(newState);
  };

  const handleRejectAll = () => {
    if (!data?.experience) return;
    const newState: Record<string, boolean> = {};
    data.experience.forEach((exp, expIdx) => {
      (exp.bullets || []).forEach((_, bulletIdx) => {
        newState[`${expIdx}-${bulletIdx}`] = false;
      });
    });
    setAcceptedBullets(newState);
  };

  const handleOpenInBuilder = () => {
    if (!data) return;
    const formattedData = formatPayloadToResumeData(data, acceptedBullets);
    localStorage.setItem('careerops_resume_data', JSON.stringify(formattedData));
    router.push('/build');
  };

  const projectedScore = data?.projectedScore ?? 94;
  const scoreBoost = Math.max(0, projectedScore - originalScore);

  const integratedKeywords = useMemo(() => {
    if (!data) return [];
    if (data.integratedKeywords && data.integratedKeywords.length > 0) {
      return data.integratedKeywords;
    }
    if (data.keywordMapping && data.keywordMapping.length > 0) {
      return Array.from(new Set(data.keywordMapping.map((km) => km.keyword)));
    }
    return [];
  }, [data]);

  const totalBulletsCount = useMemo(() => {
    if (!data?.experience) return 0;
    return data.experience.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0);
  }, [data]);

  const acceptedBulletsCount = useMemo(() => {
    if (!data?.experience) return 0;
    let count = 0;
    data.experience.forEach((exp, expIdx) => {
      (exp.bullets || []).forEach((_, bulletIdx) => {
        if (acceptedBullets[`${expIdx}-${bulletIdx}`] !== false) {
          count++;
        }
      });
    });
    return count;
  }, [data, acceptedBullets]);

  const formattedResumeData = useMemo(() => {
    if (!data) return null;
    return formatPayloadToResumeData(data, acceptedBullets);
  }, [data, acceptedBullets]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal Content Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-7xl h-[92vh] bg-background border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-5 bg-card/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-primary shadow-sm">
                  <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                    ✨ Top-Grade AI Resume Strategy & Workspace
                  </h2>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Interactive side-by-side STAR bullet review with real-time keyword injection toggles
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close workspace modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-28 w-28 rounded-full border-4 border-indigo-500/20 animate-ping" />
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground flex items-center justify-center gap-2">
                    <Wand2 className="h-5 w-5 text-indigo-500 animate-bounce" />
                    Synthesizing Top-Grade STAR Bullets...
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">
                    {loadingSteps[stepIndex]}
                  </p>
                </div>
                <div className="w-full max-w-xs bg-muted/60 rounded-full h-2 overflow-hidden border border-border">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full"
                    initial={{ width: '10%' }}
                    animate={{ width: `${((stepIndex + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ) : data ? (
              /* Content Workspace */
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Top Stats Bar */}
                <div className="p-4 sm:p-5 border-b border-border/60 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                  {/* Gauge Card */}
                  <div className="flex items-center gap-4 bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                      <Zap className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">ATS Match Score</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> +{scoreBoost}% Boost
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold tracking-tight text-foreground">
                          {projectedScore}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (Original: {originalScore}%)
                        </span>
                      </div>
                      {/* Gauge Bar */}
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: `${originalScore}%` }}
                          animate={{ width: `${projectedScore}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keywords Count Card */}
                  <div className="flex items-center gap-4 bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-muted-foreground block">
                        Integrated Keywords
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold tracking-tight text-emerald-500">
                          {integratedKeywords.length}
                        </span>
                        <span className="text-xs text-muted-foreground">ATS Terms Added</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Woven directly into STAR bullets
                      </p>
                    </div>
                  </div>

                  {/* Bullets Toggled Counter & Bulk Action */}
                  <div className="flex items-center justify-between bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-xs gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-xs font-semibold text-muted-foreground block">
                        Accepted STAR Bullets
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold tracking-tight text-foreground">
                          {acceptedBulletsCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {totalBulletsCount} Bullets
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleAcceptAll}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Accept All STAR Bullets"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> All
                      </button>
                      <button
                        onClick={handleRejectAll}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                        title="Reset/Reject All Bullets"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integrated Keyword Pill Cloud */}
                {integratedKeywords.length > 0 && (
                  <div className="px-4 sm:px-6 py-3 border-b border-border/40 bg-card/20 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" /> Target Keywords:
                    </span>
                    {integratedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      >
                        <Plus className="h-3 w-3 text-emerald-500" />
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Side-by-Side Review Grid */}
                <div className="flex-1 p-4 sm:p-6 space-y-6">
                  {/* Summary Review if present */}
                  {data.summary && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        Professional Summary Strategy
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-card/40 border border-border/60 space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Original Summary
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {data.originalSummary || data.summary}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider block">
                            ✨ Tailored Executive Summary
                          </span>
                          <p className="text-xs text-foreground leading-relaxed font-medium">
                            {data.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Side-by-Side Grid */}
                  {data.experience && data.experience.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                          Work Experience STAR Bullets Review
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          Toggle Accept / Reject per bullet point
                        </span>
                      </div>

                      {/* Header Row for Side-by-Side Grid */}
                      <div className="hidden md:grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" /> Candidate Original Bullets
                        </div>
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Tailored STAR Bullets & Keyword Badges
                        </div>
                      </div>

                      {/* Loop over experiences */}
                      {data.experience.map((exp, expIdx) => {
                        const originalBullets = exp.originalBullets || [];
                        const tailoredBullets = exp.bullets || [];

                        return (
                          <div
                            key={expIdx}
                            className="rounded-2xl border border-border/80 bg-card/30 overflow-hidden shadow-xs space-y-3"
                          >
                            {/* Role / Company Banner */}
                            <div className="p-3.5 px-4 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  {exp.role}
                                </span>
                                <span className="text-xs text-muted-foreground">at</span>
                                <span className="font-semibold text-xs text-indigo-500">
                                  {exp.company}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium">
                                {exp.startDate} - {exp.endDate}
                              </span>
                            </div>

                            {/* Bullets Comparison Table / Cards */}
                            <div className="p-4 space-y-3">
                              {tailoredBullets.map((tailoredBullet, bulletIdx) => {
                                const key = `${expIdx}-${bulletIdx}`;
                                const isAccepted = acceptedBullets[key] !== false;
                                const origBullet =
                                  originalBullets[bulletIdx] ||
                                  (originalBullets.length === 1 ? originalBullets[0] : null);

                                const matchedKws = getMatchingKeywords(
                                  tailoredBullet,
                                  integratedKeywords,
                                  data.keywordMapping
                                );

                                return (
                                  <div
                                    key={bulletIdx}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl border transition-all"
                                    style={{
                                      borderColor: isAccepted
                                        ? 'rgba(16, 185, 129, 0.3)'
                                        : 'rgba(239, 68, 68, 0.2)',
                                      backgroundColor: isAccepted
                                        ? 'rgba(16, 185, 129, 0.02)'
                                        : 'rgba(239, 68, 68, 0.02)',
                                    }}
                                  >
                                    {/* Left Column: Original Bullet */}
                                    <div className="space-y-1 text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="text-muted-foreground/60 font-bold shrink-0 mt-0.5">•</span>
                                      <div className="leading-relaxed">
                                        <span className="md:hidden font-semibold text-[11px] uppercase block text-muted-foreground/80 mb-0.5">
                                          Original:
                                        </span>
                                        {origBullet ? (
                                          origBullet
                                        ) : (
                                          <span className="italic text-muted-foreground/60">
                                            Original bullet unformatted or general responsibility.
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right Column: Tailored STAR Bullet & Controls */}
                                    <div className="space-y-2 text-xs flex flex-col justify-between">
                                      <div className="space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-start gap-2 leading-relaxed">
                                            <span
                                              className={`font-bold shrink-0 mt-0.5 ${
                                                isAccepted ? 'text-emerald-500' : 'text-muted-foreground'
                                              }`}
                                            >
                                              •
                                            </span>
                                            <span
                                              className={`font-medium ${
                                                isAccepted
                                                  ? 'text-foreground'
                                                  : 'text-muted-foreground line-through opacity-75'
                                              }`}
                                            >
                                              {tailoredBullet}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Keyword Injection Badges */}
                                        {matchedKws.length > 0 && (
                                          <div className="flex flex-wrap gap-1 pt-1 pl-4">
                                            {matchedKws.map((kw, kwIdx) => (
                                              <span
                                                key={kwIdx}
                                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                              >
                                                <Plus className="w-3 h-3 text-emerald-500" />
                                                {kw}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Accept / Reject Toggle Button */}
                                      <div className="flex items-center justify-end pt-2 border-t border-border/30">
                                        <button
                                          onClick={() => toggleBullet(key)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                            isAccepted
                                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-2xs'
                                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20'
                                          }`}
                                        >
                                          {isAccepted ? (
                                            <>
                                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                                              <span>Accepted</span>
                                            </>
                                          ) : (
                                            <>
                                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                                              <span>Rejected</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm">No tailored data available.</p>
              </div>
            )}

            {/* Footer Bar (Sticky Action Bar) */}
            {data && !isLoading && (
              <div className="border-t border-border/80 p-4 sm:p-5 bg-card/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  <span className="font-semibold text-foreground">
                    {acceptedBulletsCount} of {totalBulletsCount} STAR bullets
                  </span>{' '}
                  accepted for final resume output.
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Action Button 1: Open & Edit in Builder */}
                  <button
                    onClick={handleOpenInBuilder}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open & Edit in Builder
                  </button>

                  {/* Action Button 2: Download ATS PDF */}
                  {isClient && formattedResumeData && (
                    <PDFDownloadLink
                      document={<ExecutiveTemplate data={formattedResumeData} />}
                      fileName={`Tailored_Resume_${(
                        formattedResumeData.fullName || 'Tailored'
                      ).replace(/\s+/g, '_')}.pdf`}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                    >
                      {({ loading }) => (
                        <>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Preparing PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download ATS PDF</span>
                            </>
                          )}
                        </>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
