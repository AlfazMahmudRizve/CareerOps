'use client';

import { useState } from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Faqs } from '@/components/landing/Faqs';
import { AboutAuthor } from '@/components/landing/AboutAuthor';
import BuildPage from './build/page';
import OptimizePage from './optimize/page';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'landing' | 'build' | 'analyze'>('landing');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden">
      
      {/* Dynamic SPA Router */}
      <div className="w-full relative min-h-screen">
          <AnimatePresence mode="wait">
            {activeTab === 'landing' && (
              <motion.div 
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                className="w-full"
              >
                  <Hero onAction={(tab) => setActiveTab(tab)} />
                  <Features />
                  <HowItWorks />
                  <Faqs />
                  <AboutAuthor />
              </motion.div>
            )}

            {activeTab === 'build' && (
              <motion.div 
                key="build"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                className="w-full"
              >
                <div className="py-4 px-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md">
                    <button onClick={() => setActiveTab('landing')} className="text-zinc-400 hover:text-white text-sm">← Back to Overview</button>
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('analyze')} className="text-sm font-bold text-primary hover:text-primary/80">Switch to Analyzer →</button>
                    </div>
                </div>
                <BuildPage />
              </motion.div>
            )}

            {activeTab === 'analyze' && (
              <motion.div 
                key="analyze"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                className="w-full"
              >
                <div className="py-4 px-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md">
                    <button onClick={() => setActiveTab('landing')} className="text-zinc-400 hover:text-white text-sm">← Back to Overview</button>
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('build')} className="text-sm font-bold text-teal-400 hover:text-teal-300">Switch to Builder →</button>
                    </div>
                </div>
                {/* OptimizePage no longer needs its own margins since it handles itself, but we wrap it */}
                <div className="mt-[-40px]"> 
                    <OptimizePage />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </main>
  );
}
