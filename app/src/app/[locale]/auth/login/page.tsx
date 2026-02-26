'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiShieldCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockLine,
  RiCheckLine,
  RiInformationLine
} from 'react-icons/ri';
import { useAuth } from '../../../../components/providers/AuthProvider';
import { post } from '../../../../utils/apiClient';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation with specific messages
    if (!email.trim()) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">📧 البريد الإلكتروني مطلوب</span>
          <span className="text-xs text-base-content/70">يرجى إدخال بريدك الإلكتروني للمتابعة</span>
        </div>,
        { autoClose: 4000, icon: false }
      );
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">⚠️ تنسيق البريد غير صحيح</span>
          <span className="text-xs text-base-content/70">يرجى إدخال بريد إلكتروني صالح (مثال: user@company.com)</span>
        </div>,
        { autoClose: 4000, icon: false }
      );
      return;
    }

    if (!password) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">🔑 كلمة المرور مطلوبة</span>
          <span className="text-xs text-base-content/70">يرجى إدخال كلمة المرور للمتابعة</span>
        </div>,
        { autoClose: 4000, icon: false }
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">⚠️ كلمة المرور قصيرة جداً</span>
          <span className="text-xs text-base-content/70">كلمة المرور يجب أن تكون 6 أحرف على الأقل</span>
        </div>,
        { autoClose: 4000, icon: false }
      );
      return;
    }

    try {
      setIsLoading(true);
      const data = await post<{ token: string; user: any }>('/auth/login', { email, password });
      login(data.token, data.user);
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">✅ تم تسجيل الدخول بنجاح!</span>
          <span className="text-xs text-base-content/70">مرحباً {data.user?.name || 'بك'}! جاري التحويل للوحة التحكم...</span>
        </div>,
        { autoClose: 2000, icon: false }
      );
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 500);
    } catch (err: any) {
      // Handle different error types with specific messages
      if (err.code === 'ERR_NETWORK' || err.message?.includes('NETWORK_ERROR') || err.message?.includes('CONNECTION')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="text-xs text-base-content/70">معلومات التسجيل غير صحيحة</span>
          </div>,
          { autoClose: 6000, icon: false }
        );
      } else if (err.response?.status === 401) {
        const errorData = err.response?.data;
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">❌ بيانات الدخول غير صحيحة</span>
            <span className="text-xs text-base-content/70">
              {errorData?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'}
            </span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      } else if (err.response?.status === 404) {
        const errorData = err.response?.data;
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">👤 الحساب غير موجود</span>
            <span className="text-xs text-base-content/70">{errorData?.error || 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني. يرجى التسجيل أولاً.'}</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      } else if (err.response?.status === 403) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">🚫 الحساب معطل</span>
            <span className="text-xs text-base-content/70">تم تعطيل حسابك. يرجى التواصل مع الإدارة للمساعدة.</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      } else if (err.response?.status === 429) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">⏳ محاولات كثيرة</span>
            <span className="text-xs text-base-content/70">تم تجاوز عدد محاولات الدخول المسموحة. يرجى الانتظار بضع دقائق.</span>
          </div>,
          { autoClose: 6000, icon: false }
        );
      } else if (err.response?.status === 500) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">🔧 خطأ في الخادم</span>
            <span className="text-xs text-base-content/70">حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      } else {
        const errorData = err.response?.data;
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">❌ فشل تسجيل الدخول</span>
            <span className="text-xs text-base-content/70">{errorData?.error || err.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 to-base-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(var(--p)/0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative w-full max-w-md">
        {/* Header with enhanced styling */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <RiShieldCheckLine className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            CyberGuard
          </h1>
          <p className="text-base-content/60 text-sm mt-2">{t('loginTitle')}</p>
        </div>

        {/* Main card with glass morphism effect */}
        <div className="card bg-base-100/80 backdrop-blur-sm shadow-2xl border border-base-300/50 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-linear-to-r from-primary via-secondary to-accent" />

          <div className="card-body p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field with left accent line */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-primary to-secondary rounded-full" />
                <div className="pl-4">
                  <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <RiMailLine size={14} className="text-primary" />
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className={`input input-bordered w-full bg-base-100/50 backdrop-blur-sm transition-all duration-300 ${focusedField === 'email' ? 'border-primary shadow-lg shadow-primary/10' : ''
                      }`}
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field with left accent line */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-secondary to-accent rounded-full" />
                <div className="pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider flex items-center gap-1">
                      <RiLockLine size={14} className="text-secondary" />
                      {t('password')}
                    </label>
                    <Link
                      href={`/${locale}/auth/forgot-password`}
                      className="text-xs text-primary/70 hover:text-primary transition-colors duration-200"
                    >
                      {t('forgetPassword')}
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-bordered w-full bg-base-100/50 backdrop-blur-sm pr-10 transition-all duration-300 ${focusedField === 'password' ? 'border-secondary shadow-lg shadow-secondary/10' : ''
                        }`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-all duration-200 hover:scale-110"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus text-white gap-2 h-12 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <RiShieldCheckLine size={20} />
                    Sign in
                  </>
                )}
              </button>
            </form>




            {/* Register link */}
            <p className="text-center text-sm text-base-content/50 mt-4">
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/auth/register`}
                className="text-primary hover:text-primary-focus font-medium transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                {t('register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-base-content/40">
          <span className="flex items-center gap-1 hover:text-base-content/60 transition-colors duration-200">
            <RiShieldCheckLine size={14} className="text-primary/60" />
            SSL Secure
          </span>
          <span className="text-base-content/20">•</span>
          <span className="flex items-center gap-1 hover:text-base-content/60 transition-colors duration-200">
            <RiCheckLine size={14} className="text-secondary/60" />
            2FA Available
          </span>
          <span className="text-base-content/20">•</span>
          <span className="flex items-center gap-1 hover:text-base-content/60 transition-colors duration-200">
            <RiInformationLine size={14} className="text-accent/60" />
            SSO Ready
          </span>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-base-content/30 mt-3 flex items-center justify-center gap-1">
          <RiShieldCheckLine size={12} />
          Enterprise-grade security • End-to-end encrypted
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
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