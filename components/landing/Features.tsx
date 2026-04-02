'use client';

import { Eye, Shield, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: Eye,
        title: 'Blind-Spot Analysis',
        description: 'Find exactly what your resume is missing against the JD.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Upload. Optimize. Vanish. We never save your file.',
    },
    {
        icon: Bot,
        title: 'ATS Simulator',
        description: 'See your resume how the robots see it.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
};

export function Features() {
    return (
        <section className="container py-12 md:py-24 lg:py-32 px-4 md:px-6">
            <motion.div 
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        variants={cardVariants}
                        whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                        className="group relative overflow-hidden rounded-lg border bg-background p-8 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <motion.div 
                            className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                        >
                            <feature.icon className="h-6 w-6 text-primary" />
                        </motion.div>
                        <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
