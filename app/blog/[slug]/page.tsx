import { getPostBySlug, getPosts } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.meta.title,
    description: post.meta.description,
    authors: [{ name: post.meta.author }],
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.publishDate,
      authors: [post.meta.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // E-E-A-T JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.meta.title,
    "description": post.meta.description,
    "author": {
      "@type": "Person",
      "name": post.meta.author,
      "jobTitle": post.meta.authorRole,
      "url": "https://whoisalfaz.me"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CareerOps",
      "logo": {
        "@type": "ImageObject",
        "url": "https://careerops.whoisalfaz.me/logo.png"
      }
    },
    "datePublished": post.meta.publishDate,
    "dateModified": post.meta.publishDate,
  };

  return (
    <article className="max-w-3xl mx-auto py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-12">
        <Link href="/blog" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-emerald-500 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blog
        </Link>
        <div className="flex items-center gap-3 text-sm text-zinc-500 font-mono mb-6">
          <time dateTime={post.meta.publishDate}>{post.meta.publishDate}</time>
          <span>•</span>
          <span>{post.meta.readingTime}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
          {post.meta.title}
        </h1>
        
        {/* Author Bio Banner (E-E-A-T Signal) */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-emerald-400 font-bold text-xl">{post.meta.author.charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-white mb-0.5 text-lg">{post.meta.author}</p>
            <p className="text-sm text-zinc-400">{post.meta.authorRole}</p>
          </div>
        </div>
      </div>

      <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-img:rounded-xl">
        <MDXRemote source={post.content} />
      </div>

      <div className="mt-16 pt-8 border-t border-zinc-800">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Want to check your resume privately?</h3>
            <p className="text-zinc-400 mb-6">CareerOps analyzes your resume entirely in your browser. We never see your data, we never store it, and we definitely don't sell it.</p>
            <Link 
                href="/build" 
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-4 rounded-full transition-colors"
            >
                Start Free Analysis
            </Link>
        </div>
      </div>
    </article>
  );
}
