'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  RiShieldCheckLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine
} from 'react-icons/ri';
import { post } from '../../../../utils/apiClient';

function ResetPasswordContent() {
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
    } else {
      setIsTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    
    if (!token) {
      toast.error('رابط غير صالح');
      return;
    }
    
    try {
      setIsLoading(true);
      await post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      toast.success('تم تغيير كلمة المرور بنجاح!');
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error('الرابط منتهي الصلاحية أو غير صالح');
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
          <p className="text-base-content/60 text-sm mt-2">كلمة مرور جديدة</p>
        </div>

        {/* Main card */}
        <div className="card bg-base-100/80 backdrop-blur-sm shadow-2xl border border-base-300/50 overflow-hidden">
          <div className="h-1 bg-linear-to-r from-primary via-secondary to-accent" />

          <div className="card-body p-8">
            {isTokenValid === false ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-error text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-base-content mb-2">رابط غير صالح</h3>
                <p className="text-base-content/60 mb-6">
                  هذا الرابط منتهي الصلاحية أو غير صالح
                </p>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="btn btn-primary w-full"
                >
                  طلب رابط جديد
                </Link>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RiCheckLine className="text-success" size={40} />
                </div>
                <h3 className="text-xl font-bold text-base-content mb-2">تم تغيير كلمة المرور!</h3>
                <p className="text-base-content/60 mb-6">
                  يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
                </p>
                <Link
                  href={`/${locale}/auth/login`}
                  className="btn btn-primary w-full gap-2"
                >
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1">
                      <RiLockLine size={14} className="text-primary" />
                      كلمة المرور الجديدة
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered w-full bg-base-100/50 pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1">
                      <RiLockLine size={14} className="text-secondary" />
                      تأكيد كلمة المرور
                    </span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full bg-base-100/50"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {/* Password strength indicator */}
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-success' : 'bg-base-300'}`} />
                  <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-success' : 'bg-base-300'}`} />
                  <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-success' : 'bg-base-300'}`} />
                  <div className={`h-1 flex-1 rounded ${/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) ? 'bg-success' : 'bg-base-300'}`} />
                </div>
                <p className="text-xs text-base-content/50">
                  استخدم 6 أحرف على الأقل، يُفضل مزيج من أحرف وأرقام ورموز
                </p>

                <button
                  type="submit"
                  className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 gap-2 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <RiCheckLine size={20} />
                      حفظ كلمة المرور الجديدة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-base-content/30 mt-3 flex items-center justify-center gap-1">
          <RiShieldCheckLine size={12} />
          كلمة المرور مشفرة ومحمية
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}