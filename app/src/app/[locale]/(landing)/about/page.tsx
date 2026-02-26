'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RiShieldLine, RiTeamLine, RiRocketLine, RiHeartLine, RiCheckLine, RiArrowRightLine, RiStarLine, RiGlobalLine } from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

const TEAM = [
    { name: 'Ahmed Hassan', role: 'CEO & Founder', image: 'A' },
    { name: 'Sarah Mohamed', role: 'CTO', image: 'S' },
    { name: 'Omar Khaled', role: 'Head of Security', image: 'O' },
    { name: 'Nour Ali', role: 'Lead Developer', image: 'N' },
];

export default function AboutPage() {
    const t = useTranslations('landing.about');
    const tValues = useTranslations('landing.about.values.items');
    const tStats = useTranslations('landing.about.stats');
    const tCta = useTranslations('landing.about.cta');

    const VALUES = [
        { icon: RiShieldLine, title: tValues('security'), description: tValues('securityDesc') },
        { icon: RiRocketLine, title: tValues('innovation'), description: tValues('innovationDesc') },
        { icon: RiHeartLine, title: tValues('customer'), description: tValues('customerDesc') },
        { icon: RiGlobalLine, title: tValues('global'), description: tValues('globalDesc') },
    ];

    const MILESTONES = [
        { year: '2020', title: t('journey.milestones.2020.title'), description: t('journey.milestones.2020.description') },
        { year: '2021', title: t('journey.milestones.2021.title'), description: t('journey.milestones.2021.description') },
        { year: '2022', title: t('journey.milestones.2022.title'), description: t('journey.milestones.2022.description') },
        { year: '2023', title: t('journey.milestones.2023.title'), description: t('journey.milestones.2023.description') },
        { year: '2024', title: t('journey.milestones.2024.title'), description: t('journey.milestones.2024.description') },
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

                    {/* Mission */}
                    <div className="bg-base-200/30 rounded-3xl p-8 md:p-12 border border-base-300/50 mb-16">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-4">{t('mission.title')}</h2>
                            <p className="text-lg text-base-content/70">
                                {t('mission.description')}
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content text-center mb-8">{t('values.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {VALUES.map((value, index) => (
                                <div key={index} className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50 text-center hover:border-primary/30 transition-colors">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="text-primary" size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-base-content mb-2">{value.title}</h3>
                                    <p className="text-sm text-base-content/60">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content text-center mb-8">{t('journey.title')}</h2>
                        <div className="relative">
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20" />
                            <div className="space-y-8">
                                {MILESTONES.map((milestone, index) => (
                                    <div key={index} className={`relative flex items-center gap-6 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                                            <div className={`bg-base-200/30 rounded-2xl p-6 border border-base-300/50 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'} max-w-md`}>
                                                <div className="text-primary font-bold text-lg">{milestone.year}</div>
                                                <h3 className="text-xl font-semibold text-base-content">{milestone.title}</h3>
                                                <p className="text-sm text-base-content/60">{milestone.description}</p>
                                            </div>
                                        </div>
                                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
                                        <div className="flex-1 ml-8 md:hidden">
                                            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                                                <div className="text-primary font-bold text-lg">{milestone.year}</div>
                                                <h3 className="text-xl font-semibold text-base-content">{milestone.title}</h3>
                                                <p className="text-sm text-base-content/60">{milestone.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 hidden md:block" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Team */}
                    <div className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content text-center mb-8">{t('team.title')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {TEAM.map((member, index) => (
                                <div key={index} className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50 text-center hover:border-primary/30 transition-colors">
                                    <div className="w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                        {member.image}
                                    </div>
                                    <h3 className="font-semibold text-base-content">{member.name}</h3>
                                    <p className="text-sm text-base-content/60">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-linear-to-br from-primary to-secondary rounded-3xl p-8 md:p-12 mb-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                            <div>
                                <div className="text-3xl md:text-4xl font-bold">10K+</div>
                                <div className="text-sm text-white/70">{tStats('organizations')}</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold">50M+</div>
                                <div className="text-sm text-white/70">{tStats('credentials')}</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold">99.9%</div>
                                <div className="text-sm text-white/70">{tStats('uptime')}</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                                <div className="text-sm text-white/70">{tStats('support')}</div>
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
                            <Link href="/features" className="btn btn-outline btn-primary">
                                {tCta('features')}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
