import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const locales = ['en', 'ar'];

    const publicRoutes = [
        '',
        '/about',
        '/contact',
        '/features',
        '/pricing',
        '/privacy',
        '/security',
        '/terms',
        '/auth/login',
        '/auth/register',
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    locales.forEach((locale) => {
        publicRoutes.forEach((route) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'daily' : 'weekly',
                priority: route === '' ? 1.0 : 0.8,
            });
        });
    });

    return sitemapEntries;
}
