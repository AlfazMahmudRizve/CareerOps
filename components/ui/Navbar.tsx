'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="relative h-8 w-8 overflow-hidden rounded-sm">
                        <Image
                            src="/logo.png"
                            alt="CareerOps Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        CareerOps
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/optimize" className="hover:text-foreground transition-colors">Analyzer</Link>
                        <Link href="/build" className="hover:text-foreground transition-colors">Resume Builder</Link>
                        <Link href="https://whoisalfaz.me/portfolio/" target="_blank" className="hover:text-foreground transition-colors">Portfolio</Link>
                    </nav>
                    <div className="ml-4 pl-4 border-l border-white/10">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
