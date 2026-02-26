'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiShieldCheckLine,
  RiAddLine,
  RiCloseLine,
  RiBuildingLine,
  RiGlobalLine,
  RiMailLine,
  RiUserLine,
  RiLockLine,
  RiCheckLine,
  RiEyeOffLine,
  RiEyeLine
} from 'react-icons/ri';
import { useAuth } from '../../../../components/providers/AuthProvider';
import { post } from '../../../../utils/apiClient';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams();
  const { login } = useAuth();

  const [form, setForm] = useState({
    companyName: '',
    domain: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [emailDomains, setEmailDomains] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addEmailDomain = () => setEmailDomains((prev) => [...prev, '']);
  const removeEmailDomain = (i: number) =>
    setEmailDomains((prev) => prev.filter((_, idx) => idx !== i));
  const updateEmailDomain = (i: number, value: string) =>
    setEmailDomains((prev) => prev.map((d, idx) => (idx === i ? value : d)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const validDomains = emailDomains.filter((d) => d.trim());
    if (!validDomains.length) {
      toast.error('Add at least one email domain');
      return;
    }

    try {
      setIsLoading(true);
      const data = await post<{ token: string; user: any }>('/auth/register', {
        companyName: form.companyName,
        domain: form.domain,
        emailDomains: validDomains,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        password: form.password,
      });
      login(data.token, data.user);
      toast.success('Account created! Welcome to CyberGuard.');
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('NETWORK_ERROR') || err.message?.includes('CONNECTION')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">🌐 خطأ في الاتصال</span>
            <span className="text-xs text-base-content/70">فشل الاتصال بالخادم، يرجى التحقق من الإنترنت.</span>
          </div>,
          { autoClose: 6000, icon: false }
        );
      } else if (err.response?.status === 409) {
        const errorData = err.response?.data;
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">⚠️ الحساب موجود بالفعل</span>
            <span className="text-xs text-base-content/70">{errorData?.error || 'هذا البريد الإلكتروني أو النطاق مسجل لدينا بالفعل.'}</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      } else {
        const errorData = err.response?.data;
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">❌ فشل إنشاء الحساب</span>
            <span className="text-xs text-base-content/70">{errorData?.error || err.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.'}</span>
          </div>,
          { autoClose: 5000, icon: false }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 to-base-300 flex items-center justify-center p-4 py-12 relative overflow-hidden">
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

      <div className="relative w-full max-w-2xl">
        {/* Header with enhanced styling */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <RiShieldCheckLine className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            CyberGuard
          </h1>
          <p className="text-base-content/60 text-sm mt-2">{t('registerTitle')}</p>
        </div>

        {/* Main card with glass morphism effect */}
        <div className="card bg-base-100/80 backdrop-blur-sm shadow-2xl border border-base-300/50 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-linear-to-r from-primary via-secondary to-accent" />

          <div className="card-body p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-primary to-secondary rounded-full" />
                <div className="pl-4">
                  <h3 className="text-sm font-semibold text-base-content/80 mb-4 flex items-center gap-2">
                    <RiBuildingLine className="text-primary" size={18} />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control col-span-1 ">
                      <label className="label block mb-2">
                        <span className="label-text flex items-center gap-1">
                          <RiBuildingLine size={14} className="text-base-content/60" />
                          {t('companyName')}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered focus:input-primary transition-all duration-300 w-full"
                        placeholder="Acme Corporation"
                        value={form.companyName}
                        onChange={(e) => update('companyName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control col-span-1">
                      <label className="label block mb-2">
                        <span className="label-text flex items-center gap-1">
                          <RiGlobalLine size={14} className="text-base-content/60" />
                          {t('domain')}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered focus:input-primary transition-all duration-300 w-full"
                        placeholder="acme.com"
                        value={form.domain}
                        onChange={(e) => update('domain', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Domains Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-secondary to-accent rounded-full" />
                <div className="pl-4">
                  <h3 className="text-sm font-semibold text-base-content/80 mb-4 flex items-center gap-2">
                    <RiMailLine className="text-secondary" size={18} />
                    Allowed Email Domains
                  </h3>
                  <div className="space-y-3">
                    {emailDomains.map((d, i) => (
                      <div key={i} className="flex gap-2 group">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            className="input input-bordered w-full focus:input-secondary transition-all duration-300 pl-8"
                            placeholder="@company.com"
                            value={d}
                            onChange={(e) => updateEmailDomain(i, e.target.value)}
                          />
                          <RiMailLine className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                        </div>
                        {emailDomains.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmailDomain(i)}
                            className="btn btn-square  btn-sm text-error/70 hover:text-error hover:bg-error/10 transition-all duration-300"
                          >
                            <RiCloseLine size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEmailDomain}
                      className="btn  btn-sm gap-2 text-secondary hover:text-secondary-focus hover:bg-secondary/10 transition-all duration-300"
                    >
                      <RiAddLine size={16} />
                      Add another domain
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Account Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-accent to-primary rounded-full" />
                <div className="pl-4">
                  <h3 className="text-sm font-semibold text-base-content/80 mb-4 flex items-center gap-2">
                    <RiUserLine className="text-accent" size={18} />
                    Admin Account
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-1">
                          <RiUserLine size={14} className="text-base-content/60" />
                          {t('name')}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered focus:input-accent transition-all duration-300"
                        placeholder="John Doe"
                        value={form.adminName}
                        onChange={(e) => update('adminName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-1">
                          <RiMailLine size={14} className="text-base-content/60" />
                          {t('email')}
                        </span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered focus:input-accent transition-all duration-300"
                        placeholder="admin@company.com"
                        value={form.adminEmail}
                        onChange={(e) => update('adminEmail', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-1">
                          <RiLockLine size={14} className="text-base-content/60" />
                          {t('password')}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="input input-bordered w-full focus:input-accent transition-all duration-300 pr-10"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                        </button>
                      </div>
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level * 25
                                  ? passwordStrength >= 75
                                    ? 'bg-success'
                                    : passwordStrength >= 50
                                      ? 'bg-warning'
                                      : 'bg-error'
                                  : 'bg-base-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-base-content/60">
                            {passwordStrength < 50 && 'Weak password'}
                            {passwordStrength >= 50 && passwordStrength < 75 && 'Medium password'}
                            {passwordStrength >= 75 && 'Strong password'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-1">
                          <RiLockLine size={14} className="text-base-content/60" />
                          Confirm Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`input input-bordered w-full focus:input-accent transition-all duration-300 pr-10 ${form.confirmPassword && (passwordsMatch ? 'border-success' : 'border-error')
                            }`}
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={(e) => update('confirmPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/60"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                        </button>
                        {form.confirmPassword && passwordsMatch && (
                          <RiCheckLine className="absolute right-10 top-1/2 -translate-y-1/2 text-success" size={18} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus text-white gap-2 h-12 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <RiShieldCheckLine size={20} />
                    {t('registerButton')}
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-base-content/50 mt-4">
              {t('haveAccount')}{' '}
              <Link
                href={`/${locale}/auth/login`}
                className="text-primary hover:text-primary-focus font-medium transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-base-content/40">
          <span className="flex items-center gap-1">
            <RiShieldCheckLine size={14} />
            SSL Secure
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <RiCheckLine size={14} />
            256-bit Encryption
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <RiCheckLine size={14} />
            GDPR Compliant
          </span>
        </div>
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