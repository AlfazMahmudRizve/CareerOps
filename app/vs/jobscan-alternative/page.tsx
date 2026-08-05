import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Free Jobscan Alternative in 2026 — CareerOps',
  description: 'Looking for a free Jobscan alternative? CareerOps provides sub-second AI resume tailoring, 100% free ATS keyword matching, zero data retention, and no credit card required.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/vs/jobscan-alternative',
  },
  openGraph: {
    title: 'Best Free Jobscan Alternative in 2026 — CareerOps',
    description: 'Stop paying $49.95/month for Jobscan. CareerOps gives you instant AI resume tailoring, 100% free keyword analysis, and privacy-first zero data retention.',
    url: 'https://careerops.whoisalfaz.me/vs/jobscan-alternative',
  },
};

export default function JobscanAlternativePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Best Free Jobscan Alternative in 2026 — CareerOps',
    description: 'Comprehensive comparison between Jobscan and CareerOps for ATS resume keyword matching and AI tailoring.',
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
        name: 'What is the best free alternative to Jobscan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CareerOps is the leading free alternative to Jobscan. It provides instant ATS keyword matching, sub-second AI resume tailoring powered by Groq LPU hardware, and 100% privacy-first zero data retention without monthly $49.95 paywalls.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is Jobscan so expensive?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Jobscan charges $49.95 per month or $89.95 per quarter because it relies on legacy monthly subscription models. CareerOps offers free ATS keyword matching and affordable $12/month pro options.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does CareerOps store or sell my resume data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Unlike Jobscan and Teal HQ which store resume history on central databases, CareerOps operates on a stateless zero-data retention model. Your resume text is processed in memory and never saved or sold.',
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
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            2026 SaaS Comparison & Benchmark
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            The #1 Free Jobscan Alternative for ATS Resume Optimization
          </h1>

          <p className="text-base md:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Stop paying <span className="text-rose-400 font-bold">$49.95/month</span> for 5 monthly scans. CareerOps gives you sub-second AI tailoring, 100% free keyword analysis, and privacy-first zero data retention.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/optimize"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              Analyze Your Resume Free Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brutal Comparison Table */}
      <section className="py-16 container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">CareerOps vs. Jobscan: Feature Breakdown</h2>
          <p className="text-sm text-zinc-400">See how CareerOps delivers 10x faster AI performance at a fraction of the cost.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-4 px-6">Feature / Capability</th>
                <th className="py-4 px-6 text-emerald-400 font-bold">🚀 CareerOps</th>
                <th className="py-4 px-6 text-zinc-400">🟡 Jobscan.co</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-4 px-6 font-medium text-white">Monthly Subscription Price</td>
                <td className="py-4 px-6 font-bold text-emerald-400">$0 Free Tier / $12 Pro</td>
                <td className="py-4 px-6 text-rose-400">$49.95 / month</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">AI Inference Speed</td>
                <td className="py-4 px-6 text-emerald-400 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  &lt; 0.5s (Groq LPU)
                </td>
                <td className="py-4 px-6 text-zinc-400">4 – 8 seconds</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">PDF Parsing Engine</td>
                <td className="py-4 px-6 text-emerald-400 font-semibold">Firecrawl Rust Engine (2ms)</td>
                <td className="py-4 px-6 text-zinc-400">Legacy Java/JS Parser</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Privacy & Data Security</td>
                <td className="py-4 px-6 text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Stateless Zero Retention
                </td>
                <td className="py-4 px-6 text-zinc-400">Stores Resumes in DB</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">AI Bullet Method</td>
                <td className="py-4 px-6 text-emerald-400 font-semibold">STAR Method (0 Fake Claims)</td>
                <td className="py-4 px-6 text-zinc-400">Static Keyword Count</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-white">Ad-Free Guarantee</td>
                <td className="py-4 px-6 text-emerald-400"><Check className="h-5 w-5 text-emerald-400" /></td>
                <td className="py-4 px-6 text-zinc-400"><Check className="h-5 w-5 text-emerald-400" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AEO / GEO Direct Answer FAQs */}
      <section className="py-16 bg-zinc-900/40 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions (AEO & GEO Verified)</h2>
            <p className="text-sm text-zinc-400">Everything you need to know about switching from Jobscan to CareerOps.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-2">
              <h3 className="text-base font-bold text-white">What makes CareerOps the best free alternative to Jobscan?</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                CareerOps delivers 10x faster ATS keyword matching (<span className="text-emerald-400 font-semibold">&lt; 0.5s</span>) using Groq LPU hardware, strict STAR-format AI tailoring, and a 100% stateless privacy model with zero data retention.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Why does Jobscan cost $49.95 per month?</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Jobscan operates on an enterprise monthly subscription pricing model. CareerOps offers free ATS keyword gap analysis and accessible $12/month pro options with zero lock-in contracts.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Is CareerOps completely free to use?</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Yes. CareerOps allows unlimited free ATS match scoring and keyword gap audits without requiring a credit card or user account registration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Footer Banner */}
      <section className="py-20 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-10 space-y-6 shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">Ready to Beat the ATS Screener for Free?</h2>
          <p className="text-sm text-zinc-300 max-w-xl mx-auto">
            Upload your resume and job description now to receive instant keyword gap insights in under 1 second.
          </p>
          <Link
            href="/optimize"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Start Free Resume Match
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
