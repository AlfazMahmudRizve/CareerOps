'use client';

import { Linkedin, ExternalLink, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function AboutAuthor() {
    return (
        <section className="container py-24 px-4 md:px-6 border-t border-border/40 bg-gradient-to-b from-background to-secondary/5">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Built by Alfaz Mahmud Rizve
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Proving that AI intelligence doesn&apos;t require sacrificing privacy.
                    </p>
                </motion.div>

                <motion.div 
                    className="p-8 rounded-2xl border bg-card text-card-foreground shadow-sm"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <blockquote className="text-lg leading-relaxed mb-8 italic">
                        &quot;Your career history is personal, not training data. I built CareerOps to challenge the industry standard: providing Elite AI Optimization without ever storing a single byte of your file. This is <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 dark:text-white dark:bg-none">Stateless Engineering</span>.&quot;
                    </blockquote>

                    <motion.div 
                        className="flex flex-wrap justify-center gap-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        {[
                            { href: "https://www.linkedin.com/in/alfaz-mahmud-rizve/", icon: Linkedin, label: "LinkedIn", color: "hover:text-blue-500" },
                            { href: "https://facebook.com/alfazmahmudrizve", icon: Facebook, label: "Facebook", color: "hover:text-blue-600" },
                            { href: "https://www.instagram.com/whois.alfaz/", icon: Instagram, label: "Instagram", color: "hover:text-pink-500" },
                            { href: "https://www.youtube.com/@whoisalfazz", icon: Youtube, label: "YouTube", color: "hover:text-red-500" },
                            { href: "mailto:contact@whoisalfaz.me", icon: Mail, label: "Email", color: "hover:text-primary" },
                            { href: "https://whoisalfaz.me/labs/", icon: ExternalLink, label: "View My Lab ↗", color: "hover:text-purple-400" },
                        ].map((link, i) => (
                            <motion.div
                                key={link.label}
                                whileHover={{ y: -3, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.35 + i * 0.08 }}
                            >
                                <Link href={link.href} target={link.href.startsWith('mailto') ? undefined : '_blank'} className={`flex items-center gap-2 text-muted-foreground ${link.color} transition-colors group`}>
                                    <link.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
