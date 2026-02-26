'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RiCheckLine, RiArrowRightLine, RiStarLine } from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function PricingPage() {
    const t = useTranslations('landing.pricing');
    const tStarter = useTranslations('landing.pricing.plans.starter');
    const tProfessional = useTranslations('landing.pricing.plans.professional');
    const tEnterprise = useTranslations('landing.pricing.plans.enterprise');
    const tFaq = useTranslations('landing.pricing.faq');
    const tCta = useTranslations('landing.pricing.cta');

    const PRICING_PLANS = [
        {
            name: tStarter('name'),
            price: tStarter('price'),
            period: '',
            description: tStarter('description'),
            features: [
                tStarter('features.domain'),
                tStarter('features.breach'),
                tStarter('features.reports'),
                tStarter('features.support'),
                tStarter('features.team')
            ],
            cta: tStarter('cta'),
            popular: false,
            color: 'from-gray-500 to-gray-600'
        },
        {
            name: tProfessional('name'),
            price: tProfessional('price'),
            period: tProfessional('period'),
            description: tProfessional('description'),
            features: [
                tProfessional('features.domain'),
                tProfessional('features.port'),
                tProfessional('features.alerts'),
                tProfessional('features.ssl'),
                tProfessional('features.risk'),
                tProfessional('features.support'),
                tProfessional('features.team')
            ],
            cta: tProfessional('cta'),
            popular: true,
            popularLabel: tProfessional('popular'),
            color: 'from-primary to-secondary'
        },
        {
            name: tEnterprise('name'),
            price: tEnterprise('price'),
            period: '',
            description: tEnterprise('description'),
            features: [
                tEnterprise('features.domain'),
                tEnterprise('features.integrations'),
                tEnterprise('features.manager'),
                tEnterprise('features.sla'),
                tEnterprise('features.onPremise'),
                tEnterprise('features.reporting'),
                tEnterprise('features.team')
            ],
            cta: tEnterprise('cta'),
            popular: false,
            color: 'from-purple-500 to-indigo-500'
        }
    ];

    const FAQ = [
        { question: tFaq('trial.question'), answer: tFaq('trial.answer') },
        { question: tFaq('payment.question'), answer: tFaq('payment.answer') },
        { question: tFaq('change.question'), answer: tFaq('change.answer') },
        { question: tFaq('discount.question'), answer: tFaq('discount.answer') }
    ];

    return (
        <div className="min-h-screen bg-base-100">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {PRICING_PLANS.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-3xl p-8 border transition-all duration-300 ${plan.popular
                                    ? 'bg-linear-to-br from-primary/10 to-secondary/10 border-primary/50 scale-105 shadow-xl'
                                    : 'bg-base-200/30 border-base-300/50 hover:border-primary/30'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-primary to-secondary rounded-full text-xs text-white font-medium flex items-center gap-1">
                                        <RiStarLine size={12} /> {plan.popularLabel}
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold text-base-content mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-base-content">{plan.price}</span>
                                        {plan.period && <span className="text-base-content/60">{plan.period}</span>}
                                    </div>
                                    <p className="text-sm text-base-content/60 mt-2">{plan.description}</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-center gap-3 text-sm">
                                            <RiCheckLine className="text-success shrink-0" size={16} />
                                            <span className="text-base-content/70">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.name === tEnterprise('name') ? '/contact' : '/auth/register'}
                                    className={`btn w-full ${plan.popular
                                        ? 'btn-primary bg-linear-to-r from-primary to-secondary border-0'
                                        : 'btn-outline btn-primary'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Feature Comparison */}
                    <div className="bg-base-200/30 rounded-3xl p-8 border border-base-300/50 mb-16">
                        <h2 className="text-2xl font-bold text-base-content mb-6 text-center">{t('comparison.title')}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-base-300">
                                        <th className="text-left py-4 text-base-content/70">{t('comparison.feature')}</th>
                                        <th className="text-center py-4 text-base-content/70">{tStarter('name')}</th>
                                        <th className="text-center py-4 text-primary">{tProfessional('name')}</th>
                                        <th className="text-center py-4 text-base-content/70">{tEnterprise('name')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-base-300/50">
                                    {[
                                        [t('comparison.domains'), '1', '5', t('comparison.unlimited')],
                                        [t('comparison.portScanning'), '—', '✓', '✓'],
                                        [t('comparison.sslMonitoring'), '—', '✓', '✓'],
                                        [t('comparison.breachDetection'), t('comparison.basic'), t('comparison.advanced'), t('comparison.advanced')],
                                        [t('comparison.riskAssessment'), '—', '✓', '✓'],
                                        [t('comparison.apiAccess'), '—', '—', '✓'],
                                        [t('comparison.ssoSaml'), '—', '—', '✓'],
                                        [t('comparison.dedicatedSupport'), '—', t('comparison.priority'), t('comparison.dedicatedManager')]
                                    ].map(([feature, starter, pro, enterprise], i) => (
                                        <tr key={i}>
                                            <td className="py-4 text-base-content">{feature}</td>
                                            <td className="py-4 text-center text-base-content/60">{starter}</td>
                                            <td className="py-4 text-center text-primary font-medium">{pro}</td>
                                            <td className="py-4 text-center text-base-content/60">{enterprise}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-base-content mb-8 text-center">{tFaq('title')}</h2>
                        <div className="space-y-4">
                            {FAQ.map((faq, index) => (
                                <div key={index} className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                                    <h3 className="font-semibold text-base-content mb-2">{faq.question}</h3>
                                    <p className="text-base-content/60">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-linear-to-br from-primary to-secondary rounded-3xl p-8 md:p-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{tCta('title')}</h2>
                            <p className="text-white/80 mb-6">{tCta('description')}</p>
                            <Link href="/contact" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0">
                                {tCta('contact')} <RiArrowRightLine size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}