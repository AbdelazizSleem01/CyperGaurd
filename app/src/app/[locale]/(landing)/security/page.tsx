'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RiShieldLine, RiLockLine, RiServerLine, RiKeyLine, RiEyeLine, RiCheckLine, RiArrowRightLine, RiAlertLine, RiDatabaseLine } from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function SecurityPage() {
    const t = useTranslations('landing.security');
    const tFeatures = useTranslations('landing.security.features');
    const tVulnerability = useTranslations('landing.security.vulnerability');
    const tDataProtection = useTranslations('landing.security.dataProtection');
    const tCta = useTranslations('landing.security.cta');

    const SECURITY_FEATURES = [
        { icon: RiLockLine, title: tFeatures('encryption.title'), description: tFeatures('encryption.description') },
        { icon: RiServerLine, title: tFeatures('infrastructure.title'), description: tFeatures('infrastructure.description') },
        { icon: RiKeyLine, title: tFeatures('access.title'), description: tFeatures('access.description') },
        { icon: RiEyeLine, title: tFeatures('audit.title'), description: tFeatures('audit.description') },
        { icon: RiDatabaseLine, title: tFeatures('residency.title'), description: tFeatures('residency.description') },
        { icon: RiAlertLine, title: tFeatures('incident.title'), description: tFeatures('incident.description') },
    ];

    const COMPLIANCE = [
        { name: 'SOC 2 Type II', status: t('compliance.certified') },
        { name: 'ISO 27001', status: t('compliance.certified') },
        { name: 'GDPR', status: t('compliance.compliant') },
        { name: 'HIPAA', status: t('compliance.compliant') },
        { name: 'PCI DSS', status: t('compliance.level1') },
        { name: 'CCPA', status: t('compliance.compliant') },
    ];

    const PRACTICES = [
        t('practices.item1'),
        t('practices.item2'),
        t('practices.item3'),
        t('practices.item4'),
        t('practices.item5'),
        t('practices.item6'),
    ];

    return (
        <div className="min-h-screen bg-base-100">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <RiShieldLine className="text-white" size={36} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Security Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {SECURITY_FEATURES.map((feature, index) => (
                            <div key={index} className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50 hover:border-primary/30 transition-colors">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon className="text-primary" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-base-content mb-2">{feature.title}</h3>
                                <p className="text-sm text-base-content/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Compliance */}
                    <div className="bg-base-200/30 rounded-3xl p-8 md:p-12 border border-base-300/50 mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content text-center mb-8">{t('compliance.title')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {COMPLIANCE.map((item, index) => (
                                <div key={index} className="text-center p-4 bg-base-100/50 rounded-xl">
                                    <div className="text-primary font-bold text-sm">{item.name}</div>
                                    <div className="text-xs text-success mt-1">{item.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Practices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        <div>
                            <h2 className="text-2xl font-bold text-base-content mb-6">{t('practices.title')}</h2>
                            <ul className="space-y-3">
                                {PRACTICES.map((practice, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <RiCheckLine className="text-success shrink-0" size={18} />
                                        <span className="text-base-content/70">{practice}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                            <h3 className="text-xl font-bold text-base-content mb-4">{tVulnerability('title')}</h3>
                            <p className="text-base-content/60 mb-4">
                                {tVulnerability('description')}
                            </p>
                            <div className="space-y-3">
                                <Link href="mailto:security@cyberguard.com" className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0">
                                    {tVulnerability('email')}
                                </Link>
                                <p className="text-xs text-center text-base-content/40">
                                    {tVulnerability('responseTime')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Data Protection */}
                    <div className="bg-linear-to-br from-primary to-secondary rounded-3xl p-8 md:p-12 mb-16">
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">{tDataProtection('title')}</h2>
                            <p className="text-white/80 mb-6">
                                {tDataProtection('description')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                {tDataProtection('badges').split(', ').map((badge, index) => (
                                    <div key={index} className="px-4 py-2 bg-white/10 rounded-full text-sm">{badge}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-4">{tCta('title')}</h2>
                        <p className="text-base-content/60 mb-6 max-w-xl mx-auto">
                            {tCta('description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact" className="btn btn-primary bg-linear-to-r from-primary to-secondary border-0 gap-2">
                                {tCta('contact')} <RiArrowRightLine size={18} />
                            </Link>
                            <Link href="/privacy" className="btn btn-outline btn-primary">
                                {tCta('privacy')}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}