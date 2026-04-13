import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content/blog');

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  author: string;
  authorRole: string;
  readingTime: string;
  category: string;
};

export type BlogPost = {
  meta: BlogPostMeta;
  content: string;
};

export function getPosts(): BlogPostMeta[] {
  if (!fs.existsSync(contentDir)) return [];
  
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      return {
        slug: file.replace('.mdx', ''),
        ...data,
      } as BlogPostMeta;
    })
    .sort((a, b) => (new Date(a.publishDate) > new Date(b.publishDate) ? -1 : 1));

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(contentDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    meta: { slug, ...data } as BlogPostMeta,
    content,
  };
}
