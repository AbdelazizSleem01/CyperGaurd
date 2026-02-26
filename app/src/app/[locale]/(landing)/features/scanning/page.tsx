'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RiRadarLine, RiCheckLine, RiArrowRightLine, RiTimeLine, RiShieldLine, RiServerLine } from 'react-icons/ri';
import Navbar from '../../../../../components/landing/Navbar';
import Footer from '../../../../../components/landing/Footer';

export default function ScanningFeaturePage() {
    const t = useTranslations('landing.featureScanning');
    const tHowItWorks = useTranslations('landing.featureScanning.howItWorks');
    const tKeyFeatures = useTranslations('landing.featureScanning.keyFeatures');
    const tCta = useTranslations('landing.featureScanning.cta');

    const FEATURES = [
        { title: tKeyFeatures('automated'), description: tKeyFeatures('automatedDesc') },
        { title: tKeyFeatures('fingerprinting'), description: tKeyFeatures('fingerprintingDesc') },
        { title: tKeyFeatures('vulnerability'), description: tKeyFeatures('vulnerabilityDesc') },
        { title: tKeyFeatures('history'), description: tKeyFeatures('historyDesc') },
        { title: tKeyFeatures('protocol'), description: tKeyFeatures('protocolDesc') },
        { title: tKeyFeatures('rateLimit'), description: tKeyFeatures('rateLimitDesc') }
    ];

    return (
        <div className="min-h-screen bg-base-100">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <RiRadarLine className="text-white" size={36} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        <div>
                            <h2 className="text-2xl font-bold text-base-content mb-4">{tHowItWorks('title')}</h2>
                            <p className="text-base-content/60 mb-6">
                                {tHowItWorks('description')}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                        <RiTimeLine className="text-blue-500" size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base-content">{tHowItWorks('realtime.title')}</h3>
                                        <p className="text-sm text-base-content/60">{tHowItWorks('realtime.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
                                        <RiShieldLine className="text-cyan-500" size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base-content">{tHowItWorks('cve.title')}</h3>
                                        <p className="text-sm text-base-content/60">{tHowItWorks('cve.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                        <RiServerLine className="text-blue-500" size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base-content">{tHowItWorks('service.title')}</h3>
                                        <p className="text-sm text-base-content/60">{tHowItWorks('service.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                            <h2 className="text-xl font-bold text-base-content mb-4">{tKeyFeatures('title')}</h2>
                            <ul className="space-y-3">
                                {FEATURES.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <RiCheckLine className="text-success mt-0.5" size={18} />
                                        <div>
                                            <h3 className="font-medium text-base-content">{feature.title}</h3>
                                            <p className="text-sm text-base-content/60">{feature.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 md:p-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{tCta('title')}</h2>
                            <p className="text-white/80 mb-6">{tCta('description')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/register" className="btn btn-lg bg-white text-blue-600 hover:bg-white/90 border-0">
                                    {tCta('trial')} <RiArrowRightLine size={18} />
                                </Link>
                                <Link href="/features" className="btn btn-lg btn-outline text-white border-white/30 hover:bg-white/10">
                                    {tCta('allFeatures')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}