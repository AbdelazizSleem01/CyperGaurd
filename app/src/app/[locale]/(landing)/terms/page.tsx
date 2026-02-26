'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  RiFileTextLine,
  RiArrowRightLine,
  RiCheckLine,
  RiInformationLine,
  RiServerLine,
  RiUserLine,
  RiShieldLine,
  RiMoneyDollarCircleLine,
  RiDatabase2Line,
  RiTimeLine,
  RiAlertLine,
  RiScalesLine,
  RiFileCopyLine,
  RiSettings4Line,
  RiBookOpenLine,
  RiMailSendLine,
  RiHomeLine,
  RiSaveLine,
  RiFileWarningLine
} from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function TermsPage() {
  const t = useTranslations('landing.terms');
  const tSections = useTranslations('landing.terms.sections');
  const tQuickActions = useTranslations('landing.terms.quickActions');
  const tDownload = useTranslations('landing.terms.download');

  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sectionIds = ['acceptance', 'description', 'accounts', 'acceptable-use', 'payment', 'data', 'service-level', 'liability', 'indemnification', 'termination', 'intellectual-property', 'changes', 'governing-law', 'contact'];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const TERMS_SECTIONS = [
    { id: 'acceptance', title: tSections('acceptance.title'), icon: RiInformationLine, color: 'from-blue-500 to-cyan-500' },
    { id: 'description', title: tSections('description.title'), icon: RiServerLine, color: 'from-green-500 to-emerald-500' },
    { id: 'accounts', title: tSections('accounts.title'), icon: RiUserLine, color: 'from-purple-500 to-indigo-500' },
    { id: 'acceptable-use', title: tSections('acceptableUse.title'), icon: RiShieldLine, color: 'from-red-500 to-pink-500' },
    { id: 'payment', title: tSections('payment.title'), icon: RiMoneyDollarCircleLine, color: 'from-yellow-500 to-orange-500' },
    { id: 'data', title: tSections('data.title'), icon: RiDatabase2Line, color: 'from-teal-500 to-cyan-500' },
    { id: 'service-level', title: tSections('serviceLevel.title'), icon: RiTimeLine, color: 'from-indigo-500 to-purple-500' },
    { id: 'liability', title: tSections('liability.title'), icon: RiAlertLine, color: 'from-orange-500 to-red-500' },
    { id: 'indemnification', title: tSections('indemnification.title'), icon: RiScalesLine, color: 'from-pink-500 to-rose-500' },
    { id: 'termination', title: tSections('termination.title'), icon: RiFileCopyLine, color: 'from-amber-500 to-yellow-500' },
    { id: 'intellectual-property', title: tSections('intellectualProperty.title'), icon: RiBookOpenLine, color: 'from-primary to-secondary' },
    { id: 'changes', title: tSections('changes.title'), icon: RiSettings4Line, color: 'from-cyan-500 to-blue-500' },
    { id: 'governing-law', title: tSections('governingLaw.title'), icon: RiScalesLine, color: 'from-violet-500 to-purple-500' },
    { id: 'contact', title: tSections('contact.title'), icon: RiMailSendLine, color: 'from-emerald-500 to-teal-500' }
  ];

  const SERVICE_FEATURES = tSections('description.items').split(', ');

  const ACCEPTABLE_USE_RULES = [
    tSections('acceptableUse.rules.0'),
    tSections('acceptableUse.rules.1'),
    tSections('acceptableUse.rules.2'),
    tSections('acceptableUse.rules.3'),
    tSections('acceptableUse.rules.4'),
    tSections('acceptableUse.rules.5')
  ];

  const PAYMENT_BADGES = tSections('payment.badges').split(', ');

  return (
    <div className="min-h-screen bg-base-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.2) 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <Navbar />

      <main className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`text-center mb-12 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/25">
                <RiFileTextLine className="text-white" size={36} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
              {t('title')}
            </h1>

            <div className="flex items-center justify-center gap-2 text-base-content/60">
              <RiFileTextLine className="animate-pulse" />
              <p className="text-sm md:text-base">
                {t('lastUpdated')}: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mt-4">
              <RiCheckLine className="text-primary" size={16} />
              <span className="text-xs md:text-sm text-primary">{t('trustBadge')}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <div className={`lg:w-72 shrink-0 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-base-200/30 rounded-2xl p-4 border border-base-300/50 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-base-content/60 mb-3 px-3 flex items-center gap-2">
                    <RiFileTextLine size={14} />
                    {t('toc')}
                  </h3>
                  <nav className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {TERMS_SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 group ${activeSection === section.id
                          ? `bg-linear-to-r ${section.color} bg-opacity-10 text-white font-medium`
                          : 'hover:bg-base-300/30 text-base-content/60 hover:text-base-content'
                          }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${section.color} ${activeSection === section.id ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'
                          }`} />
                        <span className="truncate">{section.title.replace(/^\d+\.\s/, '')}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div className="bg-linear-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 border border-primary/20">
                  <h4 className="text-sm font-semibold text-base-content mb-3">{tQuickActions('title')}</h4>
                  <div className="space-y-2">
                    <Link href="/privacy" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors group">
                      <RiShieldLine size={14} className="group-hover:scale-110 transition-transform" />
                      <span>{tQuickActions('privacy')}</span>
                    </Link>
                    <Link href="/contact" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors group">
                      <RiMailSendLine size={14} className="group-hover:scale-110 transition-transform" />
                      <span>{tQuickActions('contact')}</span>
                    </Link>
                    <Link href="/security" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors group">
                      <RiServerLine size={14} className="group-hover:scale-110 transition-transform" />
                      <span>{tQuickActions('security')}</span>
                    </Link>
                  </div>
                </div>

                {/* Download Options */}
                <div className="bg-base-200/30 rounded-2xl p-4 border border-base-300/50">
                  <h4 className="text-sm font-semibold text-base-content mb-3">{tDownload('title')}</h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between text-sm text-base-content/60 hover:text-primary transition-colors p-2 hover:bg-base-300/30 rounded-lg">
                      <span>📄 {tDownload('pdf')}</span>
                      <RiArrowRightLine size={14} />
                    </button>
                    <button className="w-full flex items-center justify-between text-sm text-base-content/60 hover:text-primary transition-colors p-2 hover:bg-base-300/30 rounded-lg">
                      <span>📝 {tDownload('text')}</span>
                      <RiArrowRightLine size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className={`bg-base-200/30 rounded-3xl p-6 md:p-8 border border-base-300/50 backdrop-blur-sm transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8 divide-y divide-base-300/30">

                    {/* Section 1: Acceptance of Terms */}
                    <section id="acceptance" className="pt-8 first:pt-0 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <RiInformationLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('acceptance.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 leading-relaxed">
                          {tSections('acceptance.content')}
                        </p>
                        <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                          <p className="text-sm text-base-content/60">
                            <strong className="text-primary">{tSections('acceptance.important')}:</strong> {tSections('acceptance.importantText')}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Description of Service */}
                    <section id="description" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <RiServerLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('description.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">
                          {tSections('description.intro')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {SERVICE_FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-base-200/50 rounded-lg">
                              <RiCheckLine className="text-green-500 shrink-0 mt-1" size={14} />
                              <span className="text-sm text-base-content/70">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 3: User Accounts */}
                    <section id="accounts" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                          <RiUserLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('accounts.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('accounts.content')}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-warning">
                          <RiAlertLine size={16} />
                          <span>{tSections('accounts.warning')}</span>
                        </div>
                      </div>
                    </section>

                    {/* Section 4: Acceptable Use */}
                    <section id="acceptable-use" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center">
                          <RiShieldLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('acceptableUse.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">{tSections('acceptableUse.intro')}</p>
                        <ul className="space-y-3">
                          {ACCEPTABLE_USE_RULES.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              </span>
                              <span className="text-base-content/70 text-sm">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>

                    {/* Section 5: Subscription and Payment */}
                    <section id="payment" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <RiMoneyDollarCircleLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('payment.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('payment.content')}
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {PAYMENT_BADGES.map((badge, idx) => (
                            <div key={idx} className="text-center p-2 bg-base-200/50 rounded-lg">
                              <span className="text-xs font-medium text-primary">{badge}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 6: Data and Content */}
                    <section id="data" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                          <RiDatabase2Line className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('data.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('data.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 7: Service Level */}
                    <section id="service-level" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <RiTimeLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('serviceLevel.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('serviceLevel.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 8: Limitation of Liability */}
                    <section id="liability" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <RiAlertLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('liability.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('liability.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 9: Indemnification */}
                    <section id="indemnification" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <RiScalesLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('indemnification.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('indemnification.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 10: Termination */}
                    <section id="termination" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                          <RiFileCopyLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('termination.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('termination.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 11: Intellectual Property */}
                    <section id="intellectual-property" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                          <RiBookOpenLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('intellectualProperty.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('intellectualProperty.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 12: Changes to Terms */}
                    <section id="changes" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <RiSettings4Line className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('changes.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('changes.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 13: Governing Law */}
                    <section id="governing-law" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                          <RiScalesLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('governingLaw.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('governingLaw.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 14: Contact Information */}
                    <section id="contact" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <RiMailSendLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('contact.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">
                          {tSections('contact.intro')}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-linear-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                            <p className="text-sm font-medium text-primary mb-2">{tSections('contact.department')}</p>
                            <a href="mailto:cypergaurd@gmail.com
" className="text-base-content/70 hover:text-primary transition-colors flex items-center gap-2">
                              <RiMailSendLine size={16} />
                              {tSections('contact.email')}
                            </a>
                          </div>
                          <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/50">
                            <p className="text-sm font-medium text-base-content mb-2">{tSections('contact.address')}</p>
                            <p className="text-base-content/70 text-sm">
                              {tSections('contact.company')}
                              <br />
                              {tSections('contact.location')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-base-200/30 rounded-lg">
                          <p className="text-xs text-base-content/50 flex items-center gap-2">
                            <RiTimeLine size={14} />
                            {tSections('contact.responseTime')}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Back Link */}
              <div className={`mt-8 text-center transform transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-focus transition-colors group bg-base-200/30 px-6 py-3 rounded-full border border-base-300/50 hover:border-primary/30"
                >
                  <RiHomeLine size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span>{t('backToHome')}</span>
                  <RiArrowRightLine size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .pl-13 {
          padding-left: 3.25rem;
        }

        @media (max-width: 640px) {
          .pl-13 {
            padding-left: 1rem;
          }
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(var(--p)/0.3);
          border-radius: 20px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(var(--p)/0.5);
        }
      `}</style>
    </div>
  );
}