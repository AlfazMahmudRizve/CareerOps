import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HeroProps {
    onAction?: (tab: 'build' | 'analyze') => void;
}

export function Hero({ onAction }: HeroProps) {
    return (
        <section className="relative flex flex-col items-center justify-center py-24 text-center lg:py-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full -z-10" />

            <div className="container px-4 md:px-6 z-10">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    Automate Your <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                        Application Strategy
                    </span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-6 max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                    The only stateless, algorithmic resume optimizer. We don&apos;t store your data. Completely Free.
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center text-center"
                >
                    <button
                        onClick={() => onAction?.('analyze')}
                        className={cn(
                            "inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:bg-gray-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        )}
                    >
                        Analyze Resume
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onAction?.('build')}
                        className={cn(
                            "inline-flex h-12 items-center justify-center rounded-md border border-white/20 bg-black/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring backdrop-blur-sm"
                        )}
                    >
                        Resume Builder
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
