'use client';

import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AboutAuthor } from '@/components/landing/AboutAuthor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden">
      {/* Hero Section - Fade In */}
      <div className="w-full animate-in fade-in zoom-in-95 duration-1000 fill-mode-both">
        <Hero />
      </div>

      {/* Features Section - Slide Up */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
        <Features />
      </div>

      {/* How It Works */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-both">
        <HowItWorks />
      </div>

      {/* About Author */}
      <div className="w-full">
        <AboutAuthor />
      </div>
    </main>
  );
}
