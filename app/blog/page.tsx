import { getPosts } from '@/lib/mdx';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering & Privacy Blog — CareerOps',
  description: 'Deep dives on Applicant Tracking Systems, privacy-first software architecture, and the engineering behind resume optimization.',
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="mb-16">
        <h1 className="text-5xl font-black text-white tracking-tight mb-4">Engineering & Privacy <span className="text-emerald-500">Log</span></h1>
        <p className="text-xl text-zinc-400">Technical deep dives from the builder of CareerOps.</p>
      </div>

      <div className="space-y-12">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <article className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl transition hover:border-emerald-500/50 hover:bg-zinc-800/50 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                <span className="text-emerald-500 font-mono text-sm">{post.publishDate}</span>
                <span className="text-zinc-600 hidden md:inline">•</span>
                <span className="text-zinc-400 text-sm">{post.readingTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                {post.description}
              </p>
              <div className="flex items-center text-emerald-500 text-sm font-semibold tracking-wide uppercase">
                Read Article <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="text-zinc-500 py-12 text-center border text-lg border-dashed border-zinc-800 rounded-xl">
            No articles published yet.
          </div>
        )}
      </div>
    </div>
  );
}
