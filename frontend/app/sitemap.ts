import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com';

function getDirectories(dirPath: string): string[] {
    try {
        // process.cwd() is the root of the Next.js project (frontend/)
        const fullPath = path.join(process.cwd(), dirPath);
        if (!fs.existsSync(fullPath)) return [];

        return fs.readdirSync(fullPath).filter(file => {
            const stat = fs.statSync(path.join(fullPath, file));
            // Filter out special Next.js folders if any, keep valid tool directories
            return stat.isDirectory() && !file.startsWith('(') && !file.startsWith('_');
        });
    } catch (error) {
        console.error(`Error generating sitemap for ${dirPath}:`, error);
        return [];
    }
}

export default function sitemap(): MetadataRoute.Sitemap {
    // 1. Dynamic PDF / Image Tools
    const pdfTools = getDirectories('app/tools');

    // 2. Dynamic IT Tools
    const itTools = getDirectories('app/it-tools');

    // 3. Dynamic Workflows (e.g. /workflow/pdf)
    const workflowDirs = getDirectories('app/workflow');
    const workflowRoutes = [
        '/workflow', // The main hub
        ...workflowDirs.map(dir => `/workflow/${dir}`)
    ];

    // 4. Static Pages (Manual list for root pages)
    const staticPages = [
        '',
        '/about',
        '/privacy',
        '/contact',
        '/tools',
        '/it-tools',
    ];

    // Generate Route Objects
    const staticMap = staticPages.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.9,
    }));

    const toolMap = pdfTools.map((tool) => ({
        url: `${BASE_URL}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    const itToolMap = itTools.map((tool) => ({
        url: `${BASE_URL}/it-tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const workflowMap = workflowRoutes.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [...staticMap, ...toolMap, ...itToolMap, ...workflowMap];
}
