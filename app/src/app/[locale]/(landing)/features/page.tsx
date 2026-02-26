'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RiRadarLine, RiShieldLine, RiBugLine, RiServerLine, RiLineChartLine, RiMailLine, RiArrowRightLine, RiCheckLine } from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function FeaturesPage() {
    const t = useTranslations('landing.features');
    const tFeatures = useTranslations('landing.features.items');
    const tCta = useTranslations('landing.features.cta');

    const FEATURES = [
        {
            icon: RiRadarLine,
            title: tFeatures('portScanning.title'),
            description: tFeatures('portScanning.description'),
            href: '/features/scanning',
            color: 'from-blue-500 to-cyan-500',
            features: [
                tFeatures('portScanning.features.0'),
                tFeatures('portScanning.features.1'),
                tFeatures('portScanning.features.2'),
                tFeatures('portScanning.features.3')
            ]
        },
        {
            icon: RiShieldLine,
            title: tFeatures('sslMonitoring.title'),
            description: tFeatures('sslMonitoring.description'),
            href: '/features/ssl',
            color: 'from-green-500 to-emerald-500',
            features: [
                tFeatures('sslMonitoring.features.0'),
                tFeatures('sslMonitoring.features.1'),
                tFeatures('sslMonitoring.features.2'),
                tFeatures('sslMonitoring.features.3')
            ]
        },
        {
            icon: RiBugLine,
            title: tFeatures('breachDetection.title'),
            description: tFeatures('breachDetection.description'),
            href: '/features/breach',
            color: 'from-red-500 to-orange-500',
            features: [
                tFeatures('breachDetection.features.0'),
                tFeatures('breachDetection.features.1'),
                tFeatures('breachDetection.features.2'),
                tFeatures('breachDetection.features.3')
            ]
        },
        {
            icon: RiServerLine,
            title: tFeatures('subdomainEnumeration.title'),
            description: tFeatures('subdomainEnumeration.description'),
            color: 'from-purple-500 to-indigo-500',
            features: [
                tFeatures('subdomainEnumeration.features.0'),
                tFeatures('subdomainEnumeration.features.1'),
                tFeatures('subdomainEnumeration.features.2'),
                tFeatures('subdomainEnumeration.features.3')
            ]
        },
        {
            icon: RiLineChartLine,
            title: tFeatures('riskAssessment.title'),
            description: tFeatures('riskAssessment.description'),
            color: 'from-yellow-500 to-amber-500',
            features: [
                tFeatures('riskAssessment.features.0'),
                tFeatures('riskAssessment.features.1'),
                tFeatures('riskAssessment.features.2'),
                tFeatures('riskAssessment.features.3')
            ]
        },
        {
            icon: RiMailLine,
            title: tFeatures('emailNotifications.title'),
            description: tFeatures('emailNotifications.description'),
            color: 'from-pink-500 to-rose-500',
            features: [
                tFeatures('emailNotifications.features.0'),
                tFeatures('emailNotifications.features.1'),
                tFeatures('emailNotifications.features.2'),
                tFeatures('emailNotifications.features.3')
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-base-100">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <RiRadarLine className="text-white" size={36} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((feature, index) => (
                            <Link
                                key={index}
                                href={feature.href || '#'}
                                className="group bg-base-200/30 rounded-2xl p-6 border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-semibold text-base-content mb-2">{feature.title}</h3>
                                <p className="text-base-content/60 mb-4">{feature.description}</p>

                                {feature.features && (
                                    <ul className="space-y-2 mb-4">
                                        {feature.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-base-content/70">
                                                <RiCheckLine className="text-success" size={16} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                                    {t('learnMore')} <RiArrowRightLine size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-linear-to-br from-primary to-secondary rounded-3xl p-8 md:p-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{tCta('title')}</h2>
                            <p className="text-white/80 mb-6">{tCta('description')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0">
                                    {tCta('trial')}
                                </Link>
                                <Link href="/pricing" className="btn btn-lg btn-outline text-white border-white/30 hover:bg-white/10 hover:border-white">
                                    {tCta('pricing')}
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