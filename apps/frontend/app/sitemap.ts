import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://arrena-photo-frontend-o4xg.onrender.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://arrena-photo-frontend-o4xg.onrender.com/templates', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://arrena-photo-frontend-o4xg.onrender.com/feed', lastModified: new Date(), changeFrequency: 'always', priority: 0.8 },
    { url: 'https://arrena-photo-frontend-o4xg.onrender.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }
  ];
}
