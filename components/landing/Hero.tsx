import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center py-24 text-center lg:py-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full -z-10" />

            <div className="container px-4 md:px-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Automate Your <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                        Application Strategy
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    The only stateless, AI-powered resume optimizer. We don&apos;t store your data.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center text-center">
                    <Link
                        href="/optimize"
                        className={cn(
                            "inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        )}
                    >
                        Analyze Resume
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                        href="/build"
                        className={cn(
                            "inline-flex h-12 items-center justify-center rounded-md border border-input bg-background/50 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm"
                        )}
                    >
                        Resume Builder
                    </Link>
                </div>
            </div>
        </section>
    );
}
