import type { Metadata } from 'next';
import { Inter, Roboto_Mono, Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../globals.css';
import { ThemeProvider } from '../../components/providers/ThemeProvider';
import { AuthProvider } from '../../components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: t('title'),
      template: `%s | CyberGuard`,
    },
    description: t('description'),
    keywords: t('keywords'),
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'icon', url: '/icon-192.png', sizes: '192x192' },
        { rel: 'icon', url: '/icon-512.png', sizes: '512x512' },
      ],
    },
    manifest: '/site.webmanifest',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      siteName: 'CyberGuard',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [
        {
          url: '/logo.png',
          width: 800,
          height: 600,
          alt: 'CyberGuard Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/logo.png'],
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();
  const isAr = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isAr ? 'rtl' : 'ltr'}
      data-theme="cyberdark"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${mono.variable} ${cairo.variable} ${isAr ? 'font-arabic' : 'font-sans'
          } antialiased`}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuthProvider>
              {children}
              <ToastContainer
                position={isAr ? 'bottom-left' : 'bottom-right'}
                autoClose={4000}
                hideProgressBar={false}
                theme="colored"
                rtl={isAr}
              />
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
