import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');

    // 1. Block Spam Referrers
    const blockedReferrers = [
        'twitter-buttons.biz',
        'free-social-buttons',
        'semalt.com',
        'buttons-for-website',
    ];

    if (referer) {
        const isSpam = blockedReferrers.some((spamDomain) =>
            referer.includes(spamDomain)
        );
        if (isSpam) {
            return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
        }
    }

    // 2. Enforce HTTPS (Production Only)
    // Skip if running on localhost to avoid breaking dev
    const isProduction = process.env.NODE_ENV === 'production';
    const proto = request.headers.get('x-forwarded-proto');
    const host = request.headers.get('host');

    if (isProduction && proto && proto === 'http' && !host?.includes('localhost')) {
        // Redirect to HTTPS
        const newUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
        return NextResponse.redirect(newUrl, 301); // Permanent redirect
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
