import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/build', '/optimize', '/templates'],
      disallow: '/private/',
    },
    sitemap: 'https://careerops.whoisalfaz.me/sitemap.xml',
  };
}
