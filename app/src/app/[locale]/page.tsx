'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  RiShieldLine,
  RiRadarLine,
  RiMailLine,
  RiLineChartLine,
  RiCheckLine,
  RiArrowRightLine,
  RiServerLine,
  RiLockPasswordLine,
  RiBugLine,
  RiTimeLine,
  RiStarLine,
  RiCustomerServiceLine,
  RiGlobalLine,
  RiAlertLine,
  RiThumbUpLine,
  RiGroupLine,
  RiSecurePaymentLine,
  RiRocketLine,
  RiSettings4Line,
  RiBarChartBoxLine,
  RiShieldCheckLine,
  RiFlashlightLine,
  RiNotification4Line
} from 'react-icons/ri';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function HomePage() {
  const t = useTranslations('landing.home');
  const tFeatures = useTranslations('landing.features');
  const tPricing = useTranslations('landing.pricing');
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const FEATURES = [
    {
      icon: RiRadarLine,
      title: tFeatures('items.portScanning.title'),
      description: tFeatures('items.portScanning.description'),
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-white',
      bgLight: 'bg-blue-500/10',
    },
    {
      icon: RiLockPasswordLine,
      title: tFeatures('items.sslMonitoring.title'),
      description: tFeatures('items.sslMonitoring.description'),
      gradient: 'from-green-500 to-emerald-500',
      color: 'text-white',
      bgLight: 'bg-green-500/10',
    },
    {
      icon: RiBugLine,
      title: tFeatures('items.breachDetection.title'),
      description: tFeatures('items.breachDetection.description'),
      gradient: 'from-red-500 to-pink-500',
      color: 'text-white',
      bgLight: 'bg-red-500/10',
    },
    {
      icon: RiServerLine,
      title: tFeatures('items.subdomainEnumeration.title'),
      description: tFeatures('items.subdomainEnumeration.description'),
      gradient: 'from-purple-500 to-indigo-500',
      color: 'text-white',
      bgLight: 'bg-purple-500/10',
    },
    {
      icon: RiLineChartLine,
      title: tFeatures('items.riskAssessment.title'),
      description: tFeatures('items.riskAssessment.description'),
      gradient: 'from-yellow-500 to-orange-500',
      color: 'text-white',
      bgLight: 'bg-yellow-500/10',
    },
    {
      icon: RiMailLine,
      title: tFeatures('items.emailNotifications.title'),
      description: tFeatures('items.emailNotifications.description'),
      gradient: 'from-teal-500 to-cyan-500',
      color: 'text-white',
      bgLight: 'bg-teal-500/10',
    },
    {
      icon: RiShieldCheckLine,
      title: t('features.securityScore'),
      description: t('features.securityScoreDesc'),
      gradient: 'from-indigo-500 to-purple-500',
      color: 'text-white',
      bgLight: 'bg-indigo-500/10',
    },
    {
      icon: RiFlashlightLine,
      title: t('features.darkWeb'),
      description: t('features.darkWebDesc'),
      gradient: 'from-orange-500 to-red-500',
      color: 'text-white',
      bgLight: 'bg-orange-500/10',
    },
    {
      icon: RiNotification4Line,
      title: t('features.smartAlerts'),
      description: t('features.smartAlertsDesc'),
      gradient: 'from-pink-500 to-rose-500',
      color: 'text-white',
      bgLight: 'bg-pink-500/10',
    },
  ];

  const STATS = [
    { value: '10K+', label: t('stats.organizations'), icon: RiGroupLine },
    { value: '50M+', label: t('stats.credentials'), icon: RiSecurePaymentLine },
    { value: '99.9%', label: t('stats.uptime'), icon: RiTimeLine },
    { value: '<5min', label: t('stats.response'), icon: RiAlertLine },
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      icon: RiGlobalLine,
      color: 'from-primary to-secondary',
    },
    {
      step: '02',
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: RiRadarLine,
      color: 'from-primary to-secondary',
    },
    {
      step: '03',
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: RiAlertLine,
      color: 'from-primary to-secondary',
    },
  ];

  const PRICING_PLANS = [
    {
      name: tPricing('plans.starter.name'),
      price: tPricing('plans.starter.price'),
      description: tPricing('plans.starter.description'),
      features: [
        tPricing('plans.starter.features.domain'),
        tPricing('plans.starter.features.breach'),
        tPricing('plans.starter.features.reports'),
        tPricing('plans.starter.features.support'),
        t('pricing.basicScanning'),
      ],
      cta: tPricing('plans.starter.cta'),
      popular: false,
      icon: RiRocketLine,
      gradient: 'from-primary to-secondary',
    },
    {
      name: tPricing('plans.professional.name'),
      price: tPricing('plans.professional.price'),
      period: tPricing('plans.professional.period'),
      description: tPricing('plans.professional.description'),
      features: [
        tPricing('plans.professional.features.domain'),
        t('pricing.advancedScanning'),
        t('pricing.realtimeAlerts'),
        tPricing('plans.professional.features.risk'),
        tPricing('plans.professional.features.support'),
        t('pricing.apiAccess'),
        t('pricing.customReports'),
      ],
      cta: tPricing('plans.professional.cta'),
      popular: true,
      icon: RiBarChartBoxLine,
      gradient: 'from-primary to-secondary',
    },
    {
      name: tPricing('plans.enterprise.name'),
      price: tPricing('plans.enterprise.price'),
      description: tPricing('plans.enterprise.description'),
      features: [
        tPricing('plans.enterprise.features.domain'),
        tPricing('plans.enterprise.features.integrations'),
        tPricing('plans.enterprise.features.manager'),
        tPricing('plans.enterprise.features.sla'),
        tPricing('plans.enterprise.features.onPremise'),
        t('pricing.advancedAnalytics'),
        t('pricing.soc2Reports'),
      ],
      cta: tPricing('plans.enterprise.cta'),
      popular: false,
      icon: RiSettings4Line,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const TESTIMONIALS = [
    {
      name: t('testimonials.ahmed.name'),
      role: t('testimonials.ahmed.role'),
      content: t('testimonials.ahmed.content'),
      rating: 5,
    },
    {
      name: t('testimonials.sara.name'),
      role: t('testimonials.sara.role'),
      content: t('testimonials.sara.content'),
      rating: 5,
    },
    {
      name: t('testimonials.mohamed.name'),
      role: t('testimonials.mohamed.role'),
      content: t('testimonials.mohamed.content'),
      rating: 5,
    },
  ];

  const TRUSTED_COMPANIES = [
    { name: 'TechCorp' },
    { name: 'FinTech Inc' },
    { name: 'E-Shop' },
    { name: 'SecureBank' },
    { name: 'CloudNet' },
  ];

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [FEATURES.length]);

  return (
    <div className="min-h-screen bg-base-100 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-linear-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-linear-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 rounded-full mb-6 transform transition-all duration-700 hover:scale-105 cursor-default ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <RiShieldLine className="text-primary animate-pulse" size={16} />
              <span className="text-sm text-primary font-medium tracking-wide bg-linear-to-r from-primary to-secondary bg-clip-text">
                {t('badge')}
              </span>
            </div>

            {/* Main Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-7xl font-bold text-base-content mb-6 leading-tight transform transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {t('hero.title')}
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent block mt-2 relative">
                {t('hero.subtitleHighlight')}
                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
              </span>
            </h1>

            {/* Description */}
            <p className={`text-lg md:text-xl text-base-content/60 max-w-3xl mx-auto mb-8 transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link
                href="/auth/register"
                className="group relative btn btn-primary btn-lg bg-linear-to-r from-primary to-secondary border-0 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 gap-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('hero.cta')}
                  <RiArrowRightLine size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-primary-focus to-secondary-focus opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="#features"
                className="group btn btn-lg bg-base-200/50 hover:bg-base-200 border-base-300 transition-all duration-300 gap-2 backdrop-blur-sm"
              >
                {t('hero.ctaSecondary')}
                <RiArrowRightLine size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12 text-sm transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center gap-2 px-4 py-2 bg-base-200/30 rounded-full backdrop-blur-sm border border-base-300/20 hover:border-primary/30 transition-all">
                <RiCheckLine className="text-success" size={16} />
                <span>{t('trustBadges.noCreditCard')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-base-200/30 rounded-full backdrop-blur-sm border border-base-300/20 hover:border-primary/30 transition-all">
                <RiCheckLine className="text-success" size={16} />
                <span>{t('trustBadges.freeTrial')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-base-200/30 rounded-full backdrop-blur-sm border border-base-300/20 hover:border-primary/30 transition-all">
                <RiCheckLine className="text-success" size={16} />
                <span>{t('trustBadges.cancelAnytime')}</span>
              </div>
            </div>

            {/* Animated Feature Preview */}
            <div className={`mt-16 relative transform transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 bg-linear-to-t from-base-100 via-transparent to-transparent z-10" />
              <div className="relative rounded-2xl border border-base-300/50 shadow-2xl overflow-hidden group hover:shadow-primary/20 transition-shadow duration-500">
                <div className="h-8 bg-base-200 flex items-center px-4 gap-2 border-b border-base-300/50">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <div className="flex-1 text-center">
                    <span className="text-xs text-base-content/40 font-mono">security-dashboard.cyberguard.com</span>
                  </div>
                </div>
                <div className="relative bg-base-200/30 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {FEATURES.slice(0, 3).map((feature, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg bg-base-100/50 backdrop-blur-sm border transition-all duration-500 ${activeFeature === idx
                          ? 'border-primary scale-105 shadow-lg shadow-primary/20'
                          : 'border-base-300/30'
                          }`}
                      >
                        <feature.icon className={`${feature.color} text-xl mb-2`} />
                        <div className="text-xs font-medium">{feature.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-12 border-y border-base-300/20 bg-base-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-base-content/40 mb-6 uppercase tracking-wider">
            {t('trustedBy')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {TRUSTED_COMPANIES.map((company, index) => (
              <div
                key={index}
                className="text-base-content/30 hover:text-primary/50 transition-colors duration-300 text-lg font-semibold"
              >
                {company.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-linear-to-b from-base-200/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-secondary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <stat.icon className="text-primary" size={28} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-base-content/60 mt-2 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative" id="features">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 rounded-full text-sm text-primary font-medium mb-4">
              🚀 {t('featuresSection.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              {t('featuresSection.title')}
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              {t('featuresSection.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-base-200/30 rounded-2xl border border-base-300/50 hover:border-primary/30 hover:bg-base-200/50 transition-all duration-500 overflow-hidden hover:translate-y-[-4px]"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-all duration-500" />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <feature.icon className={feature.color} size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-base-content mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">
                    {feature.description}
                  </p>                 
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-linear-to-b from-base-200/30 to-base-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-linear-to-r from-secondary/10 to-accent/10 rounded-full text-sm text-secondary font-medium mb-4">
              ⚡ {t('howItWorks.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/3 left-1/4 w-1/2 h-0.5 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20" />

            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                <div className="relative bg-base-100 rounded-2xl p-8 border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px]">
                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${item.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <item.icon className="text-white" size={32} />
                  </div>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-br ${item.color} opacity-20 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-base-content mb-3 relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-base-content/60 relative z-10">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-accent/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-linear-to-r from-accent/10 to-primary/10 rounded-full text-sm text-accent font-medium mb-4">
              💬 {t('testimonials.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="relative p-8 bg-base-200/30 rounded-2xl border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px] group"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                  <RiCustomerServiceLine className="text-white" size={20} />
                </div>

                <div className="flex gap-1 mb-4 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <RiStarLine key={i} className="text-yellow-500 fill-current" size={18} />
                  ))}
                </div>

                <p className="text-base-content/70 text-center mb-6 italic relative">
                  <span className="text-4xl text-primary/20 absolute -top-4 left-0">"</span>
                  {testimonial.content}
                  <span className="text-4xl text-primary/20 absolute -bottom-8 right-0">"</span>
                </p>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary mx-auto mb-3 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-base-content">{testimonial.name}</p>
                  <p className="text-sm text-base-content/50">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-linear-to-b from-base-200/30 to-base-200/50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 rounded-full text-sm text-primary font-medium mb-4">
              💎 {t('pricing.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              {tPricing('title')}
            </h2>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              {tPricing('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <div
                key={index}
                className={`relative group p-8 rounded-2xl border transition-all duration-500 ${plan.popular
                  ? 'bg-linear-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/50 scale-105 hover:scale-110 shadow-xl shadow-primary/10'
                  : 'bg-base-200/30 border-base-300/50 hover:border-primary/30 hover:scale-105 hover:shadow-lg'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-primary to-secondary rounded-full text-xs text-white font-medium flex items-center gap-1 shadow-lg">
                    <RiStarLine size={12} />
                    {tPricing('plans.professional.popular')}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${plan.gradient} bg-opacity-10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <plan.icon className="text-white" size={32} />
                </div>

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
                  href="/auth/register"
                  className={`btn w-full gap-2 transition-all duration-300 ${plan.popular
                    ? 'btn-primary bg-linear-to-r from-primary to-secondary border-0 hover:shadow-xl hover:shadow-primary/25 hover:scale-105'
                    : 'btn-outline btn-primary hover:bg-primary hover:text-white hover:scale-105'
                    }`}
                >
                  {plan.cta}
                  <RiArrowRightLine size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-base-100 rounded-full border border-base-300/50 hover:border-primary/30 transition-all group cursor-default">
              <RiSecurePaymentLine className="text-success group-hover:scale-110 transition-transform" size={20} />
              <span className="text-sm text-base-content/70">{t('pricing.guarantee')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-linear-to-br from-primary via-secondary to-accent rounded-3xl p-8 md:p-12 text-center overflow-hidden group">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }} />
            </div>

            {/* Floating elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 animate-float animation-delay-2000" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                {t('cta.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="group btn btn-lg bg-white text-primary hover:bg-white/90 border-0 gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {t('cta.button')}
                  <RiArrowRightLine size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="group btn btn-lg bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105"
                >
                  {t('cta.contact')}
                  <RiArrowRightLine size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-white/60 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <RiCheckLine size={16} className="text-white/80" />
                  <span>{t('trustBadges.noCreditCard')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <RiCheckLine size={16} className="text-white/80" />
                  <span>{t('trustBadges.freeTrial')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <RiCheckLine size={16} className="text-white/80" />
                  <span>{t('trustBadges.support24')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Add animation keyframes to global CSS */}
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
      `}</style>
    </div>
  );
}