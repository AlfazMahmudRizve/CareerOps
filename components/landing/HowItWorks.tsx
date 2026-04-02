'use client';

import { Upload, FileSearch, Sparkles, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    {
        icon: Upload,
        title: 'Upload Resume',
        description: 'Drag & drop your PDF. We parse it locally—your data never leaves your browser.',
    },
    {
        icon: FileSearch,
        title: 'Paste JD',
        description: 'Copy the job description you are targeting. We identify key requirements.',
    },
    {
        icon: Sparkles,
        title: 'Algorithmic Analysis',
        description: 'Our stateless engine identifies gaps, missing keywords, and structural issues.',
    },
    {
        icon: FileCheck,
        title: 'Get Insights',
        description: 'Receive an instant match score and a checklist of actionable improvements.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const stepVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
};

export function HowItWorks() {
    return (
        <section className="container py-24 md:py-32 px-4 md:px-6 border-t border-border/40">
            <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    How CareerOps Works
                </h2>
                <p className="mt-4 text-muted-foreground max-w-[600px] mx-auto">
                    A simple, four-step process to double your interview chances without risking your privacy.
                </p>
            </motion.div>

            <motion.div 
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        variants={stepVariants}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors relative group"
                    >
                        {/* Step number badge */}
                        <motion.span 
                            className="absolute -top-3 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300 }}
                        >
                            {index + 1}
                        </motion.span>
                        <motion.div 
                            className="p-4 rounded-full bg-primary/10 text-primary"
                            whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                        >
                            <step.icon className="h-8 w-8" />
                        </motion.div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
