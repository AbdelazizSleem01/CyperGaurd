'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  RiShieldLine,
  RiArrowRightLine,
  RiCheckLine,
  RiInformationLine,
  RiFileListLine,
  RiLockLine,
  RiTimeLine,
  RiShareBoxLine,
  RiUserSettingsLine,
  RiCodeLine,
  RiUserLine,
  RiMailSendLine,
  RiHomeLine,
  RiSecurePaymentLine,
  RiBookOpenLine,
  RiShieldCheckLine,
  RiFileWarningLine
} from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function PrivacyPage() {
  const t = useTranslations('landing.privacy');
  const tSections = useTranslations('landing.privacy.sections');
  const tQuickActions = useTranslations('landing.privacy.quickActions');

  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

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

    const sectionIds = ['introduction', 'collection', 'usage', 'security', 'retention', 'third-party', 'rights', 'cookies', 'children', 'changes', 'contact'];
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

  const PRIVACY_SECTIONS = [
    { id: 'introduction', title: tSections('introduction.title'), icon: RiInformationLine, color: 'from-blue-500 to-cyan-500' },
    { id: 'collection', title: tSections('collection.title'), icon: RiFileListLine, color: 'from-green-500 to-emerald-500' },
    { id: 'usage', title: tSections('usage.title'), icon: RiUserSettingsLine, color: 'from-purple-500 to-indigo-500' },
    { id: 'security', title: tSections('security.title'), icon: RiLockLine, color: 'from-red-500 to-pink-500' },
    { id: 'retention', title: tSections('retention.title'), icon: RiTimeLine, color: 'from-yellow-500 to-orange-500' },
    { id: 'third-party', title: tSections('thirdParty.title'), icon: RiShareBoxLine, color: 'from-teal-500 to-cyan-500' },
    { id: 'rights', title: tSections('rights.title'), icon: RiUserLine, color: 'from-indigo-500 to-purple-500' },
    { id: 'cookies', title: tSections('cookies.title'), icon: RiCodeLine, color: 'from-orange-500 to-red-500' },
    { id: 'children', title: tSections('children.title'), icon: RiShieldCheckLine, color: 'from-pink-500 to-rose-500' },
    { id: 'changes', title: tSections('changes.title'), icon: RiFileWarningLine, color: 'from-amber-500 to-yellow-500' },
    { id: 'contact', title: tSections('contact.title'), icon: RiMailSendLine, color: 'from-primary to-secondary' }
  ];

  const COLLECTION_ITEMS = [
    { title: tSections('collection.items.account.title'), desc: tSections('collection.items.account.desc') },
    { title: tSections('collection.items.security.title'), desc: tSections('collection.items.security.desc') },
    { title: tSections('collection.items.usage.title'), desc: tSections('collection.items.usage.desc') },
    { title: tSections('collection.items.device.title'), desc: tSections('collection.items.device.desc') }
  ];

  const USAGE_ITEMS = [
    tSections('usage.items.0'),
    tSections('usage.items.1'),
    tSections('usage.items.2'),
    tSections('usage.items.3'),
    tSections('usage.items.4')
  ];

  const RIGHTS_ITEMS = [
    tSections('rights.items.0'),
    tSections('rights.items.1'),
    tSections('rights.items.2'),
    tSections('rights.items.3'),
    tSections('rights.items.4'),
    tSections('rights.items.5')
  ];

  const SECURITY_BADGES = tSections('security.badges').split(', ');

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
                <RiShieldLine className="text-white" size={36} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
              {t('title')}
            </h1>

            <div className="flex items-center justify-center gap-2 text-base-content/60">
              <RiFileListLine className="animate-pulse" />
              <p className="text-sm md:text-base">
                {t('lastUpdated')}: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mt-4">
              <RiCheckLine className="text-success" size={16} />
              <span className="text-xs md:text-sm text-success">{t('trustBadge')}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <div className={`lg:w-64 shrink-0 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-base-200/30 rounded-2xl p-4 border border-base-300/50 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-base-content/60 mb-3 px-3">{t('toc')}</h3>
                  <nav className="space-y-1">
                    {PRIVACY_SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 group ${activeSection === section.id
                          ? `bg-linear-to-r ${section.color} bg-opacity-10 text-primary font-medium`
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
                    <Link href="/contact" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors">
                      <RiMailSendLine size={14} />
                      <span>{tQuickActions('contact')}</span>
                    </Link>
                    <Link href="/terms" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors">
                      <RiBookOpenLine size={14} />
                      <span>{tQuickActions('terms')}</span>
                    </Link>
                    <Link href="/security" className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors">
                      <RiSecurePaymentLine size={14} />
                      <span>{tQuickActions('security')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className={`bg-base-200/30 rounded-3xl p-6 md:p-8 border border-base-300/50 backdrop-blur-sm transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8 divide-y divide-base-300/30">
                    {/* Section 1: Introduction */}
                    <section id="introduction" className="pt-8 first:pt-0 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <RiInformationLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('introduction.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 leading-relaxed">
                          {tSections('introduction.content')}
                        </p>
                        <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                          <p className="text-sm text-base-content/60">
                            <strong className="text-primary">{tSections('introduction.commitment')}:</strong> {tSections('introduction.commitmentText')}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Information We Collect */}
                    <section id="collection" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <RiFileListLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('collection.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">{tSections('collection.intro')}</p>
                        <div className="grid gap-3">
                          {COLLECTION_ITEMS.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-base-200/50 rounded-xl">
                              <RiCheckLine className="text-green-500 shrink-0 mt-1" size={16} />
                              <div>
                                <span className="font-medium text-base-content">{item.title}:</span>
                                <span className="text-base-content/60 ml-1">{item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 3: How We Use Your Information */}
                    <section id="usage" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                          <RiUserSettingsLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('usage.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">{tSections('usage.intro')}</p>
                        <ul className="space-y-3">
                          {USAGE_ITEMS.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              </span>
                              <span className="text-base-content/70">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>

                    {/* Section 4: Data Security */}
                    <section id="security" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center">
                          <RiLockLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('security.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 leading-relaxed">
                          {tSections('security.content')}
                        </p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {SECURITY_BADGES.map((item, idx) => (
                            <div key={idx} className="text-center p-2 bg-base-200/50 rounded-lg">
                              <span className="text-xs font-medium text-primary">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 5: Data Retention */}
                    <section id="retention" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <RiTimeLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('retention.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('retention.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 6: Third-Party Services */}
                    <section id="third-party" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                          <RiShareBoxLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('thirdParty.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('thirdParty.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 7: Your Rights */}
                    <section id="rights" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <RiUserLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('rights.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70 mb-4">{tSections('rights.intro')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {RIGHTS_ITEMS.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-base-200/50 rounded-lg">
                              <RiCheckLine className="text-green-500" size={14} />
                              <span className="text-sm text-base-content/70">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 8: Cookies */}
                    <section id="cookies" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <RiCodeLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('cookies.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('cookies.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 9: Children's Privacy */}
                    <section id="children" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <RiShieldCheckLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('children.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('children.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 10: Changes to This Policy */}
                    <section id="changes" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                          <RiFileWarningLine className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-base-content">{tSections('changes.title')}</h2>
                      </div>
                      <div className="pl-13">
                        <p className="text-base-content/70">
                          {tSections('changes.content')}
                        </p>
                      </div>
                    </section>

                    {/* Section 11: Contact Us */}
                    <section id="contact" className="pt-8 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
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
                            <p className="text-sm font-medium text-primary mb-2">{tSections('contact.email')}</p>
                            <a href="mailto:cypergaurd@gmail.com
" className="text-base-content/70 hover:text-primary transition-colors flex items-center gap-2">
                              <RiMailSendLine size={16} />
                              cypergaurd@gmail.com

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
                          <p className="text-xs text-base-content/50">
                            📍 {tSections('contact.responseTime')}
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
      `}</style>
    </div>
  );
}