import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATS Resume Templates by Industry | CareerOps',
  description: 'Free, ATS-optimized resume templates for Software Engineering, Product Management, Data Science, and Design.',
  alternates: {
    canonical: 'https://careerops.whoisalfaz.me/templates',
  },
};

export default function TemplatesLayout({
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
