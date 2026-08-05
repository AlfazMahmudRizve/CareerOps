import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workday ATS Resume Scanner & Optimization Guide (2026) — CareerOps',
  description: 'Learn how to pass Workday Applicant Tracking System (ATS) screening. Free Workday ATS resume scanner, single-column formatting guide, and instant keyword gap analysis.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/ats/workday-resume-scanner',
  },
  openGraph: {
    title: 'Workday ATS Resume Scanner & Optimization Guide (2026) — CareerOps',
    description: 'Over 50% of Fortune 500 companies use Workday ATS. Test your resume against Workday keyword screeners for free with sub-second AI analysis.',
    url: 'https://careerops.whoisalfaz.me/ats/workday-resume-scanner',
  },
};

export default function WorkdayAtsScannerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'How to Pass Workday ATS Screening: 2026 Optimization Guide',
    description: 'Detailed technical guide and free AI resume scanner to optimize resumes for Workday Applicant Tracking System.',
    publisher: {
      '@type': 'Organization',
      name: 'CareerOps',
      url: 'https://careerops.whoisalfaz.me',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does Workday ATS parse resumes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Workday ATS uses automated text extraction to parse contact details, work experience, skills, and education into structured database fields. Resumes with complex tables, graphics, or multi-column text often experience parsing errors.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file format is best for Workday ATS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A clean, single-column PDF or Microsoft Word (.docx) document is optimal for Workday ATS. Standard PDF text streams are easily parsed by Workday text extractors.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-white/10">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Workday ATS Optimization Hub (2026)
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            How to Pass Workday ATS Resume Screening
          </h1>

          <p className="text-base md:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Over 50% of Fortune 500 employers use Workday ATS to auto-screen candidates. Audit your resume keyword match score against Workday rules in <span className="text-emerald-400 font-semibold">&lt; 0.5 seconds</span>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/optimize"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              Scan Resume Against Workday Rules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Golden Rules of Workday ATS */}
      <section className="py-16 container mx-auto px-4 md:px-6 max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">The 4 Golden Rules of Workday ATS Compliance</h2>
          <p className="text-sm text-zinc-400">Ensure your application is never auto-rejected by Workday screeners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">1. Single-Column Layout Only</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Workday parses text linearly top-to-bottom. Multi-column resumes often scramble work experience dates and company names into wrong database entries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">2. Exact Keyword Phrase Matching</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Workday scores candidates based on exact term matches found in the job description (e.g. &quot;Project Management&quot; vs &quot;PM&quot;).
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">3. Clear Standard Headings</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Use standard section headers: &quot;Work Experience&quot;, &quot;Educational Qualification&quot;, and &quot;Technical Skills&quot;. Creative headers like &quot;My Journey&quot; fail parsing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">4. Zero Graphics or Icons</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Never use skill rating progress bars or embedded graphic icons. Workday text extractors cannot decode images and treat them as unreadable noise.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-10 space-y-6 shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">Test Your Resume for Workday Compliance</h2>
          <p className="text-sm text-zinc-300 max-w-xl mx-auto">
            Upload your resume now to run our instant Workday ATS keyword audit and receive STAR-formatted AI bullet improvements.
          </p>
          <Link
            href="/optimize"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Run Free Workday Audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
