'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiShieldCheckLine,
  RiMailLine,
  RiCheckLine,
  RiArrowLeftLine
} from 'react-icons/ri';
import { post } from '../../../../utils/apiClient';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const { locale } = useParams();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('يرجى إدخال بريد إلكتروني صالح');
      return;
    }
    
    try {
      setIsLoading(true);
      await post('/auth/forgot-password', { email });
      setIsSuccess(true);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error('لا يوجد حساب مرتبط بهذا البريد الإلكتروني');
      } else {
        toast.error(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20 mb-4">
            <RiShieldCheckLine className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            CyberGuard
          </h1>
          <p className="text-base-content/60 text-sm mt-2">إعادة تعيين كلمة المرور</p>
        </div>

        {/* Main card */}
        <div className="card bg-base-100/80 backdrop-blur-sm shadow-2xl border border-base-300/50 overflow-hidden">
          <div className="h-1 bg-linear-to-r from-primary via-secondary to-accent" />

          <div className="card-body p-8">
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RiCheckLine className="text-success" size={40} />
                </div>
                <h3 className="text-xl font-bold text-base-content mb-2">تم إرسال البريد!</h3>
                <p className="text-base-content/60 mb-6">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>
                </p>
                <p className="text-sm text-base-content/40 mb-6">
                  لم تستلم البريد؟ تحقق من مجلد Spam أو انتظر بضع دقائق
                </p>
                <Link
                  href={`/${locale}/auth/login`}
                  className="btn btn-primary w-full gap-2"
                >
                  <RiArrowLeftLine size={18} />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            ) : (
              <>
                <p className="text-base-content/70 text-center mb-6">
                  أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-1">
                        <RiMailLine size={14} className="text-primary" />
                        البريد الإلكتروني
                      </span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered w-full bg-base-100/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 gap-2 h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <RiMailLine size={20} />
                        إرسال رابط إعادة التعيين
                      </>
                    )}
                  </button>
                </form>

                <div className="divider my-6">أو</div>

                <Link
                  href={`/${locale}/auth/login`}
                  className="btn btn-outline w-full gap-2"
                >
                  <RiArrowLeftLine size={18} />
                  العودة لتسجيل الدخول
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-base-content/30 mt-3 flex items-center justify-center gap-1">
          <RiShieldCheckLine size={12} />
          الرابط صالح لمدة ساعة واحدة فقط
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