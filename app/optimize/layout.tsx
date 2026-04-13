import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Keyword Gap Analysis | CareerOps',
  description: 'Upload your resume and compare it against any job description to discover missing ATS keywords.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/optimize',
  },
};

export default function OptimizeLayout({
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
