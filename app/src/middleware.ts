import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute =
        pathname.includes('/dashboard') ||
        pathname.includes('/scans') ||
        pathname.includes('/breaches') ||
        pathname.includes('/reports') ||
        pathname.includes('/admin');

    if (isProtectedRoute) {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
            return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
