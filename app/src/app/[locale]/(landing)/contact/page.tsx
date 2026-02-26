'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
    RiMailLine,
    RiMapPinLine,
    RiPhoneLine,
    RiSendPlaneLine,
    RiCheckLine,
    RiErrorWarningLine,
    RiShieldLine,
    RiArrowRightLine,
    RiTimeLine,
    RiCustomerServiceLine,
    RiMessageLine,
    RiTeamLine,
    RiBriefcaseLine,
    RiFileTextLine,
    RiStarLine,
    RiHeadphoneLine
} from 'react-icons/ri';
import Navbar from '../../../../components/landing/Navbar';
import Footer from '../../../../components/landing/Footer';

export default function ContactPage() {
    const t = useTranslations('landing.contact');
    const tInfo = useTranslations('landing.contact.info');
    const tDepts = useTranslations('landing.contact.departments');
    const tFaq = useTranslations('landing.contact.faq');
    const tForm = useTranslations('landing.contact.form');

    const [formData, setFormData] = useState({ name: '', email: '', department: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => { setIsVisible(true); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.department,
                    message: formData.message,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', department: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
        }
    };

    const CONTACT_INFO = [
        {
            icon: RiMailLine,
            title: tInfo('email.title'),
            value: tInfo('email.value'),
            link: `mailto:${tInfo('email.value')}`,
            description: tInfo('email.description'),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: RiPhoneLine,
            title: tInfo('phone.title'),
            value: tInfo('phone.value'),
            link: `tel:${tInfo('phone.value')}`,
            description: tInfo('phone.description'),
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: RiMapPinLine,
            title: tInfo('address.title'),
            value: tInfo('address.value'),
            description: tInfo('address.description'),
            color: 'from-purple-500 to-indigo-500'
        }
    ];

    const DEPARTMENTS = [
        { name: tDepts('sales'), email: 'cyperguard@gmail.com', icon: RiBriefcaseLine, responseTime: '2-4 hours', color: 'from-blue-500 to-cyan-500' },
        { name: tDepts('support'), email: 'cyperguard@gmail.com', icon: RiHeadphoneLine, responseTime: '1-2 hours', color: 'from-green-500 to-emerald-500', emergency: true },
        { name: tDepts('partnerships'), email: 'cyperguard@gmail.com', icon: RiTeamLine, responseTime: '24 hours', color: 'from-purple-500 to-indigo-500' },
        { name: tDepts('legal'), email: 'cyperguard@gmail.com', icon: RiFileTextLine, responseTime: '2-3 days', color: 'from-orange-500 to-red-500' }
    ];

    const FAQ_CONTACT = [
        { question: tFaq('responseTime'), answer: tFaq('responseTimeAnswer') },
        { question: tFaq('support24'), answer: tFaq('support24Answer') },
        { question: tFaq('demo'), answer: tFaq('demoAnswer') }
    ];

    return (
        <div className="min-h-screen bg-base-100 overflow-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
            </div>

            <Navbar />

            <main className="relative pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className={`text-center mb-12 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="relative w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <RiCustomerServiceLine className="text-white" size={36} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Contact Info Cards */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        {CONTACT_INFO.map((info, index) => (
                            <div key={index} className="group bg-base-200/30 rounded-2xl p-6 border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${info.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <info.icon className="text-white" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-base-content mb-1">{info.title}</h3>
                                <p className="text-sm text-base-content/60 mb-2">{info.description}</p>
                                {info.link ? (
                                    <Link href={info.link} className="text-primary hover:underline text-sm flex items-center gap-1">
                                        {info.value}
                                        <RiArrowRightLine size={14} />
                                    </Link>
                                ) : (
                                    <span className="text-base-content text-sm">{info.value}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Departments */}
                            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                                    <RiTeamLine className="text-primary" /> {tDepts('title')}
                                </h2>
                                <div className="space-y-3">
                                    {DEPARTMENTS.map((dept, index) => (
                                        <div key={index} className="p-3 bg-base-200/50 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${dept.color} flex items-center justify-center`}>
                                                    <dept.icon className="text-white" size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-base-content text-sm">{dept.name}</h3>
                                                        {dept.emergency && <span className="text-xs px-2 py-0.5 bg-error/10 text-error rounded-full">{tDepts('emergency')}</span>}
                                                    </div>
                                                    <Link href={`mailto:${dept.email}`} className="text-xs text-primary hover:underline">{dept.email}</Link>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-base-content/40">
                                                        <RiTimeLine size={10} /> {dept.responseTime}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                                <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                                    <RiMessageLine className="text-primary" /> {tFaq('title')}
                                </h2>
                                <div className="space-y-4">
                                    {FAQ_CONTACT.map((faq, index) => (
                                        <div key={index}>
                                            <h3 className="text-sm font-medium text-base-content mb-1">{faq.question}</h3>
                                            <p className="text-xs text-base-content/60">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-base-200/30 rounded-3xl p-6 md:p-8 border border-base-300/50">
                                {status === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                                            <RiCheckLine className="text-success" size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-base-content mb-2">{tForm('success.title')}</h3>
                                        <p className="text-base-content/60 mb-6">{tForm('success.description')}</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => setStatus('idle')} className="btn btn-primary">{tForm('success.another')}</button>
                                            <Link href="/" className="btn btn-outline">{tForm('success.back')}</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-xl blur-lg opacity-50 animate-pulse" />
                                                <div className="relative w-14 h-14 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                                    <RiMessageLine className="text-white" size={26} />
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                    {tForm('title')}
                                                </h2>
                                                <p className="text-sm text-base-content/60 flex items-center gap-2 mt-1">
                                                    <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                                                    {tForm('responseTime')}
                                                </p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {status === 'error' && (
                                                <div className="flex items-center gap-3 p-4 bg-error/10 rounded-xl text-error border border-error/20 animate-shake backdrop-blur-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center">
                                                        <RiErrorWarningLine size={20} />
                                                    </div>
                                                    <span className="font-medium">{tForm('error')}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Full Name Field */}
                                                <div className="form-control group">
                                                    <label className="label">
                                                        <span className="label-text flex items-center gap-1.5 text-base-content/70 font-medium">
                                                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                            {tForm('name')} <span className="text-error text-lg">*</span>
                                                        </span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="input input-bordered w-full bg-base-100/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pl-4 pr-10"
                                                            placeholder="John Doe"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                            <div className="w-2 h-2 rounded-full bg-primary/50 group-focus-within:bg-primary transition-colors"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Email Field */}
                                                <div className="form-control group">
                                                    <label className="label">
                                                        <span className="label-text flex items-center gap-1.5 text-base-content/70 font-medium">
                                                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                            {tForm('email')} <span className="text-error text-lg">*</span>
                                                        </span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            required
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="input input-bordered w-full bg-base-100/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pl-4 pr-10"
                                                            placeholder="john@example.com"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                            <RiMailLine className="w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Department Field */}
                                            <div className="form-control group">
                                                <label className="label">
                                                    <span className="label-text flex items-center gap-1.5 text-base-content/70 font-medium">
                                                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                        {tForm('department')} <span className="text-error text-lg">*</span>
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        required
                                                        value={formData.department}
                                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                        className="select select-bordered border rounded-md w-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 appearance-none pl-4 pr-10"
                                                    >
                                                        <option value="" disabled className="text-base-content/50">{tForm('selectDepartment')}</option>
                                                        <option value="sales" className="flex items-center gap-2">{tDepts('sales')}</option>
                                                        <option value="support">{tDepts('support')}</option>
                                                        <option value="partnership">{tDepts('partnerships')}</option>
                                                        <option value="legal">{tDepts('legal')}</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg className="w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message Field */}
                                            <div className="form-control group">
                                                <label className="label">
                                                    <span className="label-text flex items-center gap-1.5 text-base-content/70 font-medium">
                                                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                        {tForm('message')} <span className="text-error text-lg">*</span>
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        required
                                                        rows={5}
                                                        value={formData.message}
                                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                        className="textarea textarea-bordered border rounded-md w-full bg-base-100/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pl-4 pr-10 resize-none"
                                                        placeholder={tForm('messagePlaceholder')}
                                                    />
                                                    <div className="absolute bottom-3 right-3 pointer-events-none">
                                                        <div className="text-xs text-base-content/30">
                                                            {formData.message.length}/500
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Security Note */}
                                            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <RiShieldLine className="text-primary" size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-base-content/70">
                                                        {tForm('securityNote')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="relative group btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 gap-3 h-14 text-base font-semibold hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:hover:shadow-none overflow-hidden"
                                            >
                                                {/* Animated Background */}
                                                <div className="absolute inset-0 bg-linear-to-r from-primary-focus to-secondary-focus opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* Button Content */}
                                                <span className="relative z-10 flex items-center justify-center gap-3">
                                                    {status === 'loading' ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-sm"></span>
                                                            <span>{tForm('sending')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RiSendPlaneLine size={20} className="group-hover:scale-110 transition-transform" />
                                                            <span>{tForm('send')}</span>
                                                            <RiArrowRightLine size={18} className="group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                            </button>

                                            {/* Form Footer */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-base-content/40">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-success rounded-full"></span>
                                                        <span>{tForm('sslSecured')}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-success rounded-full"></span>
                                                        <span>{tForm('encryption')}</span>
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1">
                                                    <RiTimeLine size={12} />
                                                    <span>{tForm('avgResponse')}</span>
                                                </span>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-base-200/30 rounded-full border border-base-300/50">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-xs border-2 border-base-100">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                {[1, 2, 3, 4, 5].map((i) => <RiStarLine key={i} className="text-yellow-500 fill-current" size={16} />)}
                            </div>
                            <span className="text-sm text-base-content/60">{t('trustedBy')}</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
