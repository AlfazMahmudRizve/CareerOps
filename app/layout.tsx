import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://careerops.whoisalfaz.me'),
  title: 'CareerOps | AI-Powered Career Strategist',
  description: 'Elevate your career with AI-driven resume optimization and modern building tools. Created by Alfaz Mahmud Rizve.',
  keywords: ['Resume Builder', 'AI Career Tool', 'Job Search', 'Resume Optimizer', 'ATS Friendly', 'CareerOps', 'Alfaz Mahmud Rizve'],
  authors: [{ name: 'Alfaz Mahmud Rizve', url: 'https://whoisalfaz.me' }],
  creator: 'Alfaz Mahmud Rizve',
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
      <body className={cn('min-h-screen bg-background font-sans antialiased flex flex-col', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Navbar />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "CareerOps",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Any",
                "offers": {
                  "@type": "Offer",
                  "price": "0.00",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "128"
                }
              })
            }}
          />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
