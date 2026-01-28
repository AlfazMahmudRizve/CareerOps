import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Navbar } from '@/components/ui/Navbar';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CareerOps | AI-Powered Career Strategist',
  description: 'Elevate your career with AI-driven resume optimization and modern building tools. Created by Alfaz Mahmud.',
  keywords: ['Resume Builder', 'AI Career Tool', 'Job Search', 'Resume Optimizer', 'ATS Friendly', 'CareerOps', 'Alfaz Mahmud'],
  authors: [{ name: 'Alfaz Mahmud', url: 'https://whoisalfaz.me' }],
  creator: 'Alfaz Mahmud',
  openGraph: {
    title: 'CareerOps | AI-Powered Career Strategist',
    description: 'Elevate your career with AI-driven resume optimization and modern building tools.',
    url: 'https://careerops.whoisalfaz.me',
    siteName: 'CareerOps',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CareerOps Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
