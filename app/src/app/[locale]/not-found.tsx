'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RiShieldFlashLine, RiArrowLeftLine, RiArrowRightLine, RiRadarLine } from 'react-icons/ri';

export default function NotFound() {
    const t = useTranslations('notFound');
    const { locale } = useParams();
    const isAr = locale === 'ar';

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(var(--bc) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* Animated Icon Section */}
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping opacity-50" />
                    <div className="relative bg-base-100 border-2 border-primary/30 p-8 rounded-full shadow-2xl">
                        <RiRadarLine className="text-primary animate-spin-slow" size={80} />
                        <div className="absolute -top-2 -right-2 bg-error text-white p-2 rounded-full shadow-lg border-2 border-base-100">
                            <RiShieldFlashLine size={24} />
                        </div>
                    </div>
                </div>

                {/* Error Content */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-black bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            404
                        </h1>
                        <h2 className="text-3xl font-bold text-base-content">
                            {t('title')}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-primary font-mono text-sm uppercase tracking-widest opacity-70">
                            <span className="h-px w-8 bg-primary/30" />
                            {t('errorShield')}
                            <span className="h-px w-8 bg-primary/30" />
                        </div>
                    </div>

                    <p className="text-base-content/60 max-w-md mx-auto leading-relaxed text-lg">
                        {t('description')}
                    </p>

                    <div className="pt-8">
                        <Link
                            href={`/${locale}`}
                            className="btn btn-primary btn-lg gap-3 group relative overflow-hidden px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {isAr ? <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" /> : <RiArrowLeftLine className="group-hover:-translate-x-1 transition-transform" />}
                            <span className="relative z-10">{t('backHome')}</span>
                        </Link>
                    </div>
                </div>

                {/* Terminal Text Decoration */}
                <div className="mt-16 font-mono text-xs text-base-content/30 flex flex-col items-center gap-2">
                    <p>SCAN_STATUS: COMPLETED</p>
                    <p>RESOURCES_FOUND: 0</p>
                    <p className="animate-pulse">_WAITING_FOR_USER_INPUT</p>
                </div>
            </div>

            <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
