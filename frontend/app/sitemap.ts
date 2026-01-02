import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const tools = [
        'compress-image',
        'compress-pdf',
        'convert-image',
        'crop-pdf',
        'extract-pages',
        'gif-maker',
        'image-to-pdf',
        'merge-pdf',
        'office-to-pdf',
        'organize-pdf',
        'page-numbers',
        'pdf-to-excel',
        'pdf-to-image',
        'pdf-to-pdfa',
        'pdf-to-ppt',
        'pdf-to-word',
        'png-to-svg',
        'protect-pdf',
        'remove-pages',
        'repair-pdf',
        'resize-image',
        'rotate-pdf',
        'scan-pdf',
        'sign-pdf',
        'split-pdf',
        'unlock-pdf',
        'video-to-gif',
        'watermark-pdf',
    ];

    const staticPages = [
        '',
        '/about',
        '/privacy',
    ];

    const routes = staticPages.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    const toolRoutes = tools.map((tool) => ({
        url: `${BASE_URL}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    // IT Tools routs - currently commented out until deployed
    /*
    const itTools = [
        'jwt-parser',
        'hash-text',
        'date-time-converter',
        // ...
    ];
    */

    return [...routes, ...toolRoutes];
}
