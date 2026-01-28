'use client';

import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AboutAuthor } from '@/components/landing/AboutAuthor';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden">
      {/* Hero Section - Fade In */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <Hero />
      </motion.div>

      {/* Features Section - Slide Up */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full"
      >
        <Features />
      </motion.div>

      {/* How It Works - Staggered Internal Animations */}
      <HowItWorks />

      {/* About Author - Slide Up */}
      <AboutAuthor />
    </main>
  );
}
