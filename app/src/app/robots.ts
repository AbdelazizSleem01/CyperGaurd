import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/*/dashboard/',
                '/*/settings/',
                '/*/admin/',
                '/*/scans/',
                '/*/reports/',
                '/*/breaches/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
