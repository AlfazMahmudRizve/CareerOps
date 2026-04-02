'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Is CareerOps completely free?",
    answer: "Yes. CareerOps is currently operating as a fully free utility. You can scan your resume, identify missing ATS keywords, and export your polished resume without any paywalls."
  },
  {
    question: "What is an ATS and why does my score matter?",
    answer: "ATS stands for Applicant Tracking System. It's the software 99% of Fortune 500 companies use to filter resumes before a human ever sees them. Over 75% of resumes are rejected by algorithms because they lack the exact keywords found in the job description. Our score tells you exactly how an ATS views your resume."
  },
  {
    question: "Does CareerOps use AI to rewrite my resume?",
    answer: "Our core engine focuses on deterministic keyword extraction and structural formatting to guarantee ATS compatibility. We highlight exactly what you need to change manually, ensuring your resume remains authentic and bypasses AI-detection filters used by modern recruiters."
  },
  {
    question: "Is my data stored securely?",
    answer: "Your privacy is our priority. CareerOps uses advanced LocalStorage architecture. This means your resume data never leaves your browser and is not stored on our server databases. If you clear your browser cache, your data is gone."
  },
  {
    question: "How do I share my ATS match score?",
    answer: "Once you run a scan against a job description, you'll see a 'Share Score' button in your results dashboard. Clicking this generates a viral copy-paste snippet you can share directly to LinkedIn to show off your competitive advantage."
  }
];

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate the FAQ Schema payload
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      {/* Inject SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-border">
          <motion.h2 
            className="text-2xl font-bold leading-10 tracking-tight text-foreground sm:text-4xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <dl className="mt-10 space-y-6 divide-y divide-border">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                className="pt-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <dt>
                  <button
                    onClick={() => setOpenIndex(index === openIndex ? null : index)}
                    className="flex w-full items-start justify-between text-left text-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <motion.div
                        animate={{ rotate: index === openIndex ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </span>
                  </button>
                </dt>
                <AnimatePresence initial={false}>
                  {index === openIndex && (
                    <motion.dd
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 pr-12 text-base leading-7 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
