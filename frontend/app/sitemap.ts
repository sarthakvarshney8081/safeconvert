import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com';

export default function sitemap(): MetadataRoute.Sitemap {
    // 1. PDF / Image Tools (from app/tools)
    const pdfTools = [
        'compress-image',
        'compress-pdf',
        'convert-image',
        'crop-pdf',
        'digital-sign',
        'edit-pdf',
        'extract-pages',
        'gif-maker',
        'image-to-pdf',
        'merge-pdf',
        'ocr-pdf',
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
        'redact-pdf',
        'remove-pages',
        'repair-pdf',
        'resize-image',
        'rotate-pdf',
        'scan-pdf',
        'sign-pdf',
        'split-pdf',
        'unlock-pdf',
        'verify-signature',
        'video-to-gif',
        'watermark-pdf',
    ];

    // 2. IT Tools (from app/it-tools)
    const itTools = [
        'base64-converter',
        'bcrypt-generator',
        'benchmarking',
        'bip39-generator',
        'calculators',
        'case-converter',
        'chmod-calculator',
        'color-converter',
        'converter-utils',
        'crontab-generator',
        'data-converter',
        'date-time-converter',
        'diff-tools',
        'docker-map',
        'encryption',
        'eta-calculator',
        'git-cheatsheet',
        'hash-text',
        'hmac-generator',
        'html-tools',
        'http-status-codes',
        'integer-base-converter',
        'json-to-toml',
        'jwt-parser',
        'list-converter',
        'markdown-to-html',
        'mime-types',
        'network-utils',
        'password-strength-analyser',
        'pdf-signature-checker',
        'qr-code-generator',
        'regex-cheatsheet',
        'roman-numeral-converter',
        'rsa-key-pair-generator',
        'rss-feed-validator',
        'svg-placeholder-generator',
        'text-manipulation',
        'text-tools',
        'timezone-converter',
        'token-generator',
        'ulid-generator',
        'url-decoder',
        'url-encoder',
        'url-parser',
        'user-agent-parser',
        'uuid-generator',
        'webcam-tester',
        'wifi-qr-code',
    ];

    // 3. Workflow Pages
    const workflows = [
        '', // /workflow (hub)
        '/custom',
        '/image',
        '/ocr',
        '/pdf',
    ];

    // 4. Static Pages
    const staticPages = [
        '',
        '/about',
        '/privacy',
        '/contact',
        '/tools',
        '/it-tools',
    ];

    // Generate Routes
    const staticRoutes = staticPages.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.9,
    }));

    const toolRoutes = pdfTools.map((tool) => ({
        url: `${BASE_URL}/tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    const itToolRoutes = itTools.map((tool) => ({
        url: `${BASE_URL}/it-tools/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const workflowRoutes = workflows.map((wf) => ({
        url: `${BASE_URL}/workflow${wf}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [...staticRoutes, ...toolRoutes, ...itToolRoutes, ...workflowRoutes];
}
