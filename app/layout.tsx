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
  title: 'CareerOps | Privacy-First ATS Resume Builder',
  description: 'A completely free, stateless ATS resume builder and CV keyword scanner. Build professional resumes that pass algorithmic screening with zero data retention.',
  keywords: ['Free ATS Resume Builder', 'Stateless Resume Builder', 'Privacy First CV Maker', 'Algorithmic Screening', 'Resume Optimization', 'CareerOps', 'Alfaz Mahmud Rizve'],
  authors: [{ name: 'Alfaz Mahmud Rizve', url: 'https://whoisalfaz.me' }],
  creator: 'Alfaz Mahmud Rizve',
  openGraph: {
    title: 'CareerOps | Privacy-First ATS Resume Builder',
    description: 'A completely free, stateless ATS resume builder and CV keyword scanner.',
    url: 'https://careerops.whoisalfaz.me',
    siteName: 'CareerOps',
    images: [
      {
        url: '/logo.png', // Fallback, update if needed
        width: 1200,
        height: 630,
        alt: 'CareerOps ATS Resume Builder',
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
                "name": "CareerOps ATS Resume Builder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0.00",
                  "priceCurrency": "USD"
                },
                "featureList": "ATS Resume Building, Keyword Extraction, Stateless Privacy Architecture",
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
