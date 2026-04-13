import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from './providers';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://careerops.whoisalfaz.me'),
  title: 'Free ATS Resume Builder — CareerOps',
  description: 'Free ATS resume builder with keyword gap analysis. Privacy-first protection helping beat ATS. Zero data retention, free for job seekers today and always.',
  keywords: ['Free ATS Resume Builder', 'Stateless Resume Builder', 'Privacy First CV Maker', 'Algorithmic Screening', 'Resume Optimization', 'CareerOps', 'Alfaz Mahmud Rizve'],
  authors: [{ name: 'Alfaz Mahmud Rizve', url: 'https://whoisalfaz.me' }],
  creator: 'Alfaz Mahmud Rizve',
  openGraph: {
    title: 'Free ATS Resume Builder — CareerOps',
    description: 'Free ATS resume builder with keyword gap analysis. Privacy-first protection helping beat ATS. Zero data retention, free for job seekers today and always.',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Free ATS Resume Builder — CareerOps',
    description: 'Free ATS resume builder with keyword gap analysis. Privacy-first protection helping beat ATS. Zero data retention, free for job seekers today and always.',
    creator: '@whoisalfazz',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-7N81BS4LP5`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7N81BS4LP5', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
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
