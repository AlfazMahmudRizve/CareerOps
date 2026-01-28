import Link from 'next/link';
import { Construction, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BuildPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 text-center p-4">
            <div className="rounded-full bg-muted p-6">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Resume Builder
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                We are crafting a privacy-first resume builder. Stay tuned for the release.
            </p>
            <Link
                href="/"
                className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                )}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </div>
    );
}
