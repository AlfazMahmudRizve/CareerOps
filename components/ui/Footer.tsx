import Link from 'next/link';
import { ArrowRight, Code, Briefcase, Zap, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand & Vision Column */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-xl text-foreground">
                Career<span className="text-primary">Ops</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The high-velocity, privacy-first career strategist. Our free ATS resume builder crafts elite CVs designed to pass enterprise Applicant Tracking Systems (ATS). No paywalls, zero data retention, just pure optimization.
            </p>
            <div className="flex space-x-5">
              <a href="https://www.linkedin.com/in/alfaz-mahmud-rizve/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0077b5] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={20} />
              </a>
              <a href="https://facebook.com/alfazmahmudrizve" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/whois.alfaz/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E4405F] transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@whoisalfazz" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#FF0000] transition-colors">
                <span className="sr-only">YouTube</span>
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              
              {/* Product */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product & Tools</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/build" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Free ATS Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/analyze" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Resume Keyword Scanner
                    </Link>
                  </li>
                  <li>
                    <Link href="/templates" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Executive CV Templates
                    </Link>
                  </li>
                   <li>
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Career Optimization API (Soon)
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Ecosystem */}
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground uppercase Tracking-wider">The Ecosystem</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a href="https://cashops.whoisalfaz.me" target="_blank" rel="noopener noreferrer" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      CashOps App <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="https://whoisalfaz.me/audit" target="_blank" rel="noopener noreferrer" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      Free DevOps Audit <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="https://whoisalfaz.me/blog" target="_blank" rel="noopener noreferrer" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      Automation Blog <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Built by Alfaz (Hire Me) */}
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Code size={16} className="text-primary"/> The Architect
                </h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  CareerOps is built by <strong>Alfaz Mahmud Rizve</strong>. I eliminate manual bottlenecks for scaling agencies with autonomous n8n workflows, AI agents, and high-performance Next.js infrastructure.
                </p>
                <div className="mt-6">
                  <a 
                    href="https://whoisalfaz.me/contact" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Briefcase size={14} /> Hire Me For RevOps
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* SEO Text Block */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <p className="text-xs leading-5 text-muted-foreground/70 max-w-5xl">
            <strong>Why CareerOps?</strong> In today&apos;s digital hiring landscape, the best candidates are often blocked by automated bots. CareerOps is your ultimate career companion, offering a free suite of tools including an ATS-compliant resume builder, automated keyword optimization scanner, and professional CV structuring that guarantees high parse rates. Everything happens completely in your browser—meaning ultimate privacy with zero server-side storage of your personal data. Get more interviews with a modern cv formatted for 2026 applicant tracking systems.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 border-t border-border/50 pt-8 sm:mt-12 md:flex md:items-center md:justify-between">
          <p className="text-xs leading-5 text-muted-foreground md:order-1">
            &copy; {new Date().getFullYear()} CareerOps (by Alfaz Mahmud Rizve). All rights reserved.
          </p>
          <div className="flex space-x-6 md:order-2 mt-4 md:mt-0">
             <span className="text-xs text-muted-foreground font-mono flex items-center gap-1"><Zap size={12}/> High-Velocity Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
