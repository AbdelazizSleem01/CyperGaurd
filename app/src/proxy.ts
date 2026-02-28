import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

function getRoleFromToken(token: string): string | null {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;

        const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        const payloadJson = Buffer.from(padded, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson) as { role?: string };

        return payload.role ?? null;
    } catch {
        return null;
    }
}

const intlMiddleware = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'always',
});

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute =
        pathname.includes('/dashboard') ||
        pathname.includes('/scans') ||
        pathname.includes('/breaches') ||
        pathname.includes('/reports') ||
        pathname.includes('/admin') ||
        pathname.includes('/super-admin');

    if (isProtectedRoute) {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
            return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        }

        if (pathname.includes('/super-admin')) {
            const role = getRoleFromToken(token);
            const locale = pathname.startsWith('/ar') ? 'ar' : 'en';

            if (role !== 'super-admin') {
                return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
            }
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
