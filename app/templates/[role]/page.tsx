import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import { ROLE_DATA } from '@/lib/role-data';

// Define the shape of our route params
type Props = {
  params: { role: string }
};

function getRoleSlug(role: string) {
  return role.replace('-resume', '');
}

function formatRole(slug: string) {
  const clean = getRoleSlug(slug).split('-');
  return clean.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Generate dynamic metadata for extreme SEO ranking
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const roleName = formatRole(params.role);
  
  return {
    title: `Best ${roleName} Resume Template (ATS-Optimized) | CareerOps`,
    description: `Build a standout ${roleName} resume. Free, privacy-first ATS resume builder with ${roleName} specific keywords to pass algorithmic screening.`,
    keywords: [`${roleName} Resume`, `${roleName} CV Template`, `ATS ${roleName} Resume`, 'Resume Builder'],
  };
}

export default function TemplateRolePage({ params }: Props) {
  const roleSlug = getRoleSlug(params.role);
  const roleInfo = ROLE_DATA[roleSlug];
  const roleName = roleInfo?.title || formatRole(params.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl -z-10 opacity-50" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mt-10">
          <Badge text="Stateless Architecture" />
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            The Ultimate <span className="text-primary">{roleName}</span> Resume Template
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Algorithm-compliant formatting, high-density keyword mapping, and zero data retention. Structure your {roleName} CV to pass the ATS bots and impress the hiring manager.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href={`/build?role=${roleSlug}`}
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all flex items-center gap-2 hover:scale-105"
            >
              Use This {roleName} Template <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO & Advice Content Section */}
      <section className="py-16 sm:py-24 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Advice Column */}
            <div className="lg:col-span-2 space-y-12">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h2 className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Why {roleName}s get rejected by ATS
                </h2>
                <p>
                  Most beautiful {roleName} resumes fail before a human ever sees them. Modern Applicant Tracking Systems (ATS) strip away columns, icons, and graphics. If your formatting is complex, the bots parse your experience as garbage text, resulting in immediate rejection.
                </p>
                
                <h3>How CareerOps optimizes your {roleName} CV:</h3>
                <ul className="space-y-4 my-8 list-none pl-0">
                  {[
                    "Single-column, linear DOM structure that bots perfectly understand.",
                    "Semantic headers (H1, H2 equivalents in PDF syntax).",
                    "Standardized date formatting that passes algorithmic timeline checks.",
                    "Zero paywalls to download your PDF."
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {roleInfo && (
                  <div className="mt-12 space-y-6">
                    <h3 className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      Strategic ATS Insights for {roleName}s
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none pl-0">
                      {roleInfo.atsTips.map((tip, i) => (
                        <li key={i} className="bg-muted/50 p-4 rounded-xl border border-border/50 text-sm">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Keywords & Quick Launch */}
            <div className="space-y-8">
              {roleInfo && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    High-Density Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roleInfo.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-xs font-medium text-primary">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    Including these keywords naturally in your {roleName} summary increases your parse score by up to 85%.
                  </p>
                </div>
              )}

              <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ShieldCheck className="w-24 h-24" />
                </div>
                <h4 className="flex items-center gap-2 m-0 relative z-10">
                  Privacy Guarantee
                </h4>
                <p className="text-xs mt-3 mb-6 opacity-70 relative z-10">
                  We believe your career history is personal. Everything is processed directly in your browser.
                </p>
                <Link 
                  href={`/build?role=${roleSlug}`}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Start Scanning <ArrowRight className="w-4 h-4"/>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
      {text}
    </span>
  );
}
