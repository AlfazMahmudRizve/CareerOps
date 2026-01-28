'use client';

import { motion } from 'framer-motion';
import { Linkedin, ExternalLink, Code, Mail } from 'lucide-react';
import Link from 'next/link';

export function AboutAuthor() {
    return (
        <section className="container py-24 px-4 md:px-6 border-t border-border/40 bg-gradient-to-b from-background to-secondary/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center space-y-8"
            >
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Built by Alfaz Mahmud Rizve
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Proving that AI intelligence doesn&apos;t require sacrificing privacy.
                    </p>
                </div>

                <div className="p-8 rounded-2xl border bg-card text-card-foreground shadow-sm">
                    <blockquote className="text-lg leading-relaxed mb-8 italic">
                        &quot;Your career history is personal, not training data. I built CareerOps to challenge the industry standard: providing Elite AI Optimization without ever storing a single byte of your file. This is <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 dark:text-white dark:bg-none">Stateless Engineering</span>.&quot;
                    </blockquote>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="https://github.com/AlfazMahmudRizve/CareerOps" target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                            <Code className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">View Source Code</span>
                        </Link>
                        <Link href="mailto:contact@whoisalfaz.me" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                            <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Email</span>
                        </Link>
                        <Link href="https://www.linkedin.com/in/alfaz-mahmud-rizve/" target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                            <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">LinkedIn</span>
                        </Link>
                        <Link href="https://whoisalfaz.me/labs/" target="_blank" className="flex items-center gap-2 text-muted-foreground hover:text-purple-400 transition-colors group">
                            <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">View My Lab ↗</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
