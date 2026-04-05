import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Builder | CareerOps',
  description: 'Optmize your resume with AI and ATS-friendly templates.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/build',
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
