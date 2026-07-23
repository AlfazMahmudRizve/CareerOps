'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import type { ResumeData } from '@/components/builder/ResumeForm';
import { ExecutiveTemplate } from '@/components/pdf/ExecutiveTemplate';
import { PDFDownloadLink } from '@react-pdf/renderer';

export interface TailoredResumePayload {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: { company: string; role: string; startDate: string; endDate: string; description: string }[];
  education: { school: string; degree: string; startDate: string; endDate: string; description: string }[];
  projects: { title: string; techStack: string; link: string; description: string }[];
  skills: string;
  projectedScore: number;
  integratedKeywords: string[];
}

export interface TailorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: TailoredResumePayload | null;
  isLoading: boolean;
  originalScore?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPayloadToResumeData(data: any): ResumeData {
  const skillsStr = typeof data.skills === 'string'
    ? data.skills
    : data.skills
      ? [...(data.skills.technical || []), ...(data.skills.tools || []), ...(data.skills.soft || [])].join(', ')
      : '';

  return {
    fullName: data.personal?.fullName || data.fullName || '',
    email: data.personal?.email || data.email || '',
    phone: data.personal?.phone || data.phone || '',
    linkedin: data.personal?.linkedin || data.linkedin || '',
    portfolio: data.personal?.portfolio || data.portfolio || '',
    summary: data.summary || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    experience: (data.experience || []).map((exp: any) => ({
      company: exp.company || '',
      role: exp.role || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.description || ''),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    education: (data.education || []).map((edu: any) => ({
      school: edu.school || '',
      degree: edu.degree || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      description: edu.details || edu.description || '',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects: (data.projects || []).map((proj: any) => ({
      title: proj.title || '',
      techStack: proj.techStack || '',
      link: proj.link || '',
      description: Array.isArray(proj.bullets) ? proj.bullets.join('\n') : (proj.description || ''),
    })),
    certifications: [],
    skills: skillsStr,
  };
}

const loadingSteps = [
  'Parsing Job Description vector & target competencies...',
  'Re-aligning experience bullet points with action verbs...',
  'Weaving in missing ATS keywords without fabricating facts...',
  'Optimizing skills distribution matrix...',
  'Finalizing executive CV structure...',
];

export function TailorDrawer({
  isOpen,
  onClose,
  data,
  isLoading,
  originalScore = 45,
}: TailorDrawerProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handleOpenInBuilder = () => {
    if (!data) return;
    const formattedData = formatPayloadToResumeData(data);
    localStorage.setItem('careerops_resume_data', JSON.stringify(formattedData));
    router.push('/build');
  };

  const projectedScore = data?.projectedScore ?? 92;
  const scoreBoost = Math.max(0, projectedScore - originalScore);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border p-5 bg-card/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-primary shadow-sm">
                    <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      ✨ AI-Tailored Resume Strategy
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      ATS-aligned optimization tailored strictly to your real achievements
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {isLoading ? (
                  /* Loading State */
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-24 w-24 rounded-full border-4 border-indigo-500/20 animate-ping" />
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-semibold text-base text-foreground">
                        Tailoring Your Resume with AI...
                      </h3>
                      <p className="text-xs text-muted-foreground animate-pulse">
                        {loadingSteps[stepIndex]}
                      </p>
                    </div>
                    <div className="w-full max-w-xs bg-muted/50 rounded-full h-1.5 overflow-hidden border border-border">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                        initial={{ width: '10%' }}
                        animate={{ width: `${((stepIndex + 1) / loadingSteps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ) : data ? (
                  /* Tailored Content Preview */
                  <>
                    {/* Score Comparison Gauge Card */}
                    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" /> Projected ATS Match Score
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> +{scoreBoost}% Boost
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-foreground tracking-tight">
                            {projectedScore}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            (Original: {originalScore}%)
                          </span>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          High Match Potential
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden p-0.5 border border-border">
                        <motion.div
                          initial={{ width: `${originalScore}%` }}
                          animate={{ width: `${projectedScore}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Integrated Keywords Pills List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Integrated ATS Keywords
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {data.integratedKeywords?.length || 0} terms added naturally
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        These missing terms were woven directly into your summary and experience bullet points without introducing unverified claims:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {data.integratedKeywords && data.integratedKeywords.length > 0 ? (
                          data.integratedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                            >
                              <Check className="h-3 w-3 text-emerald-500" />
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            All targeted keywords were aligned naturally.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tailored Summary Preview */}
                    {data.summary && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Optimized Professional Summary
                        </h3>
                        <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed shadow-xs">
                          {data.summary}
                        </div>
                      </div>
                    )}

                    {/* Work Experience Bullet Highlights */}
                    {data.experience && data.experience.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Tailored Work Experience Highlights
                        </h3>
                        <div className="space-y-3">
                          {data.experience.slice(0, 3).map((exp, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs shadow-xs"
                            >
                              <div className="flex items-center justify-between font-semibold text-foreground">
                                <span>{exp.role}</span>
                                <span className="text-muted-foreground font-normal">{exp.startDate} - {exp.endDate}</span>
                              </div>
                              <div className="text-muted-foreground font-medium">{exp.company}</div>
                              {exp.description && (
                                <div className="space-y-1 pt-1">
                                  {exp.description.split('\n').map((line, lIdx) => (
                                    line.trim() ? (
                                      <div key={lIdx} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                                        <span className="text-primary font-bold">•</span>
                                        <span>{line.trim()}</span>
                                      </div>
                                    ) : null
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                    <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm">No tailored data generated yet.</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer (Sticky Action Bar) */}
              {data && !isLoading && (
                <div className="border-t border-border p-5 bg-card/60 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                  {/* Action Button 1: Open & Edit in Builder */}
                  <button
                    onClick={handleOpenInBuilder}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open & Edit in Builder
                  </button>

                  {/* Action Button 2: Download Tailored PDF */}
                  {isClient && (
                    <PDFDownloadLink
                      document={<ExecutiveTemplate data={formatPayloadToResumeData(data)} />}
                      fileName={`Tailored_Resume_${(data.fullName || 'Tailored').replace(/\s+/g, '_')}.pdf`}
                      className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
                              <span>Download Tailored PDF</span>
                            </>
                          )}
                        </>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
