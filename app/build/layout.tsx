import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Builder | CareerOps',
  description: 'Optimize your resume with AI and ATS-friendly templates.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/build',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
