'use client'
import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiBuilding2Line,
  RiUser3Line,
  RiBellLine,
  RiTimerLine,
  RiShieldKeyholeLine,
  RiGlobalLine,
  RiSaveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiAddLine,
  RiCloseLine,
  RiCheckLine,
  RiAlertLine,
  RiLockPasswordLine,
  RiMailLine,
  RiSettings3Line,
  RiInformationLine,
  RiShieldLine,
  RiRadarLine,
  RiTimeLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiDeviceLine,
  RiMapPinLine,
  RiComputerLine,
  RiSmartphoneLine,
  RiTabletLine
} from 'react-icons/ri';
import { useAuth } from 'src/components/providers/AuthProvider';
import { useTheme } from 'src/components/providers/ThemeProvider';
import { get, put, post } from '../../../../utils/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompanySettings {
  name: string;
  domain: string;
  emailDomains: string[];
}

interface ProfileSettings {
  name: string;
  email: string;
}

interface NotificationSettings {
  emailOnNewBreach: boolean;
  emailOnScanComplete: boolean;
  emailOnHighRisk: boolean;
  toastOnNewBreach: boolean;
  toastOnScanComplete: boolean;
  weeklyDigest: boolean;
  notificationEmail: string;
}

interface ScheduleSettings {
  autoScanEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  scanTime: string;
  scanDay: string;
  scanTypes: string[];
  timezone: string;
}

interface SettingsData {
  notifications: NotificationSettings;
  schedule: ScheduleSettings;
}

interface ActiveSession {
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
}

interface SecurityData {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: ActiveSession[];
  loginAttempts: number;
  isLocked: boolean;
  passwordStrength: string;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
  gradient = 'from-primary to-secondary'
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="relative pb-3">
        <div className={`absolute left-0 bottom-0 w-12 h-0.5 bg-linear-to-r ${gradient} rounded-full`} />
        <h2 className="text-base font-semibold text-base-content">{title}</h2>
        {description && (
          <p className="text-xs text-base-content/50 mt-0.5 flex items-center gap-1">
            <RiInformationLine size={12} className="text-base-content/30" />
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  label,
  description,
  checked,
  onChange,
  gradient = 'from-primary to-secondary'
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  gradient?: string;
}) {
  return (
    <label className="group relative my-1.5 flex items-center justify-between cursor-pointer py-3 px-4 rounded-xl hover:bg-base-200/30 transition-all duration-200">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-primary/5 to-transparent rounded-xl" />
      <div className="relative">
        <p className="text-sm font-medium text-base-content">{label}</p>
        {description && (
          <p className="text-xs text-base-content/40 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative">
        <div
          className={`w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${checked ? `bg-linear-to-r ${gradient}` : 'bg-base-300'}`}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`}
          />
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    </label>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations('settings');

  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Company State ──────────────────────────────────────────────────────────
  const [company, setCompany] = useState<CompanySettings>({
    name: '',
    domain: '',
    emailDomains: [''],
  });

  // ── Profile State ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileSettings>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ── Notification State ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailOnNewBreach: true,
    emailOnScanComplete: false,
    emailOnHighRisk: true,
    toastOnNewBreach: true,
    toastOnScanComplete: true,
    weeklyDigest: false,
    notificationEmail: user?.email || '',
  });

  // ── Schedule State ─────────────────────────────────────────────────────────
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    autoScanEnabled: true,
    frequency: 'daily',
    scanTime: '02:00',
    scanDay: 'monday',
    scanTypes: ['port-scan', 'ssl-check', 'breach-check', 'risk-calc'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  // ── Security State ─────────────────────────────────────────────────────────
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Scan types with translation keys
  const SCAN_TYPES = [
    { id: 'port-scan', labelKey: 'schedule.scanTypes.portScan' },
    { id: 'ssl-check', labelKey: 'schedule.scanTypes.sslCheck' },
    { id: 'subdomain-enum', labelKey: 'schedule.scanTypes.subdomainEnum' },
    { id: 'breach-check', labelKey: 'schedule.scanTypes.breachCheck' },
    { id: 'directory-scan', labelKey: 'schedule.scanTypes.directoryScan' },
    { id: 'risk-calc', labelKey: 'schedule.scanTypes.riskCalc' },
  ];

  // Tabs with translation keys
  const TABS = [
    { id: 'company', labelKey: 'tabs.company', icon: <RiBuilding2Line size={18} />, gradient: 'from-primary to-secondary' },
    { id: 'profile', labelKey: 'tabs.profile', icon: <RiUser3Line size={18} />, gradient: 'from-secondary to-accent' },
    { id: 'notifications', labelKey: 'tabs.notifications', icon: <RiBellLine size={18} />, gradient: 'from-accent to-primary' },
    { id: 'schedule', labelKey: 'tabs.schedule', icon: <RiTimerLine size={18} />, gradient: 'from-primary to-accent' },
    { id: 'security', labelKey: 'tabs.security', icon: <RiShieldKeyholeLine size={18} />, gradient: 'from-secondary to-primary' },
    { id: 'appearance', labelKey: 'tabs.appearance', icon: <RiGlobalLine size={18} />, gradient: 'from-accent to-secondary' },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const companyData = await get<CompanySettings>('/companies/me');
        if (companyData) {
          setCompany({
            name: companyData.name || '',
            domain: companyData.domain || '',
            emailDomains: companyData.emailDomains?.length ? companyData.emailDomains : [''],
          });
        }

        const settingsData = await get<SettingsData>('/settings');
        if (settingsData) {
          if (settingsData.notifications) {
            setNotifications({
              ...notifications,
              ...settingsData.notifications,
              notificationEmail: settingsData.notifications.notificationEmail || user?.email || '',
            });
          }
          if (settingsData.schedule) {
            setSchedule({
              ...schedule,
              ...settingsData.schedule,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const saveCompany = async () => {
    setSaving(true);
    try {
      const validDomains = company.emailDomains.filter((d) => d.trim());
      await put('/companies/me', { name: company.name, emailDomains: validDomains });
      toast.success(t('company.saveSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await put('/settings/profile', { name: profile.name, email: profile.email });
      toast.success(t('profile.saveSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }
    if (passwords.new.length < 8) {
      toast.error(t('profile.passwordTooShort'));
      return;
    }
    setSaving(true);
    try {
      await put('/settings/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success(t('profile.passwordChanged'));
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await put('/settings/notifications', notifications);
      toast.success(t('notifications.saveSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      // Normalize scanTime to HH:MM format before saving
      const parts = schedule.scanTime.split(':');
      const normalizedTime = `${(parts[0] || '0').padStart(2, '0')}:${(parts[1] || '0').padStart(2, '0')}`;
      const payload = {
        ...schedule,
        scanTime: normalizedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      await put('/settings/schedule', payload);
      setSchedule(payload);
      toast.success(t('schedule.saveSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const toggleScanType = (type: string) => {
    setSchedule((prev) => ({
      ...prev,
      scanTypes: prev.scanTypes.includes(type)
        ? prev.scanTypes.filter((t) => t !== type)
        : [...prev.scanTypes, type],
    }));
  };

  const addEmailDomain = () =>
    setCompany((p) => ({ ...p, emailDomains: [...p.emailDomains, ''] }));

  const removeEmailDomain = (i: number) =>
    setCompany((p) => ({
      ...p,
      emailDomains: p.emailDomains.filter((_, idx) => idx !== i),
    }));

  const updateEmailDomain = (i: number, val: string) =>
    setCompany((p) => ({
      ...p,
      emailDomains: p.emailDomains.map((d, idx) => (idx === i ? val : d)),
    }));

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // ── Security Handlers ─────────────────────────────────────────────────────
  const loadSecurityData = useCallback(async () => {
    setSecurityLoading(true);
    try {
      const data = await get<SecurityData>('/settings/security');
      setSecurityData(data);
    } catch (err) {
      console.error('Failed to load security data:', err);
    } finally {
      setSecurityLoading(false);
    }
  }, []);

  const revokeAllSessions = async () => {
    setSaving(true);
    try {
      await post('/settings/security/revoke-sessions', {});
      toast.success(t('security.sessionsRevoked'));
      loadSecurityData();
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const toggle2FA = async (enable: boolean) => {
    setSaving(true);
    try {
      await post('/settings/security/2fa/toggle', { enable });
      toast.success(enable ? t('security.twoFactorEnabledSuccess') : t('security.twoFactorDisabled'));
      loadSecurityData();
    } catch (err: any) {
      toast.error(err.message || t('company.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadSecurityData();
    }
  }, [activeTab, loadSecurityData]);

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <RiSmartphoneLine size={16} />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <RiTabletLine size={16} />;
    }
    return <RiComputerLine size={16} />;
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return locale === 'ar' ? 'الآن' : 'Just now';
    if (diffMins < 60) return locale === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins} minutes ago`;
    if (diffHours < 24) return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    return locale === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
  };

  // Days of week translations
  const daysOfWeek = locale === 'ar'
    ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 p-4 md:p-6 lg:p-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />

        <div className="relative max-w-4xl mx-auto flex items-center justify-center min-h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Tabs ────────────────────────────────────────────────────────────
  const renderContent = () => {
    const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

    switch (activeTab) {
      // ── Company ─────────────────────────────────────────────────────────────
      case 'company':
        return (
          <Section
            title={t('company.title')}
            description={t('company.description')}
            gradient="from-primary to-secondary"
          >
            <div className="space-y-6">
              <div className="form-control group">
                <label className="label">
                  <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <RiBuilding2Line size={12} className="text-primary" />
                    {t('company.name')}
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-base-200/30 focus:border-primary transition-all duration-300 group-hover:border-primary/50"
                  value={company.name}
                  onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('company.namePlaceholder')}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <RiRadarLine size={12} className="text-secondary" />
                    {t('company.primaryDomain')}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-300/50 pr-20"
                    value={company.domain}
                    disabled
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-sm">
                    {t('company.locked')}
                  </span>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/40 flex items-center gap-1">
                    <RiInformationLine size={10} />
                    {t('company.domainCannotChange')}
                  </span>
                </label>
              </div>

              <div className="form-control">
                <div className="flex items-center justify-between mb-2">
                  <label className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <RiMailLine size={12} className="text-accent" />
                    {t('company.emailDomains')}
                  </label>
                  <button
                    type="button"
                    onClick={addEmailDomain}
                    className="btn btn-xs gap-1 text-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <RiAddLine size={14} /> {t('company.addDomain')}
                  </button>
                </div>
                <div className="space-y-2">
                  {company.emailDomains.map((d, i) => (
                    <div key={i} className="flex gap-2 group/domain animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm">@</span>
                        <input
                          type="text"
                          className="input input-bordered w-full bg-base-200/30 pl-7 focus:border-accent transition-all duration-300"
                          placeholder={t('company.domainPlaceholder')}
                          value={d}
                          onChange={(e) => updateEmailDomain(i, e.target.value)}
                        />
                      </div>
                      {company.emailDomains.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailDomain(i)}
                          className="btn btn-square btn-sm text-error/50 hover:text-error hover:bg-error/5 transition-all duration-200"
                        >
                          <RiCloseLine size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/40">
                    {t('company.domainsDescription')}
                  </span>
                </label>
              </div>

              <button
                className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 mt-4"
                onClick={saveCompany}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <RiSaveLine size={16} />
                )}
                {t('company.saveButton')}
              </button>
            </div>
          </Section>
        );

      // ── Profile ─────────────────────────────────────────────────────────────
      case 'profile':
        return (
          <div className="space-y-8">
            <Section
              title={t('profile.title')}
              description={t('profile.description')}
              gradient="from-secondary to-accent"
            >
              <div className="space-y-4">
                <div className="form-control group">
                  <label className="label">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                      <RiUser3Line size={12} className="text-secondary" />
                      {t('profile.fullName')}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200/30 focus:border-secondary transition-all duration-300 group-hover:border-secondary/50"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-control group">
                  <label className="label">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                      <RiMailLine size={12} className="text-accent" />
                      {t('profile.email')}
                    </span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full bg-base-200/30 focus:border-accent transition-all duration-300 group-hover:border-accent/50"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="btn btn-secondary bg-linear-to-r from-secondary to-accent border-0 hover:from-secondary-focus hover:to-accent-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/25"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <RiSaveLine size={16} />
                    )}
                    {t('profile.saveButton')}
                  </button>
                  <span className="badge badge-lg capitalize px-4 py-3 bg-base-200/50">
                    <RiShieldLine className="text-primary mr-1" size={12} />
                    {t('profile.role')}: {user?.role}
                  </span>
                </div>
              </div>
            </Section>

            <Section
              title={t('profile.changePassword')}
              description={t('profile.passwordDescription')}
              gradient="from-accent to-primary"
            >
              <div className="space-y-4">
                {[
                  { key: 'current', labelKey: 'currentPassword' },
                  { key: 'new', labelKey: 'newPassword' },
                  { key: 'confirm', labelKey: 'confirmPassword' },
                ].map(({ key, labelKey }) => (
                  <div className="form-control group" key={key}>
                    <label className="label">
                      <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                        <RiLockPasswordLine size={12} className="text-primary" />
                        {t(`profile.${labelKey}`)}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[key as keyof typeof showPasswords] ? 'text' : 'password'}
                        className="input input-bordered w-full bg-base-200/30 pr-10 focus:border-primary transition-all duration-300"
                        placeholder={t('profile.passwordPlaceholder')}
                        value={passwords[key as keyof typeof passwords]}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, [key]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-all duration-200 hover:scale-110"
                        onClick={() =>
                          setShowPasswords((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))
                        }
                      >
                        {showPasswords[key as keyof typeof showPasswords] ? (
                          <RiEyeOffLine size={15} />
                        ) : (
                          <RiEyeLine size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Password strength indicator */}
                {passwords.new && (
                  <div className="space-y-2 p-4 bg-base-200/30 rounded-xl">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = getPasswordStrength(passwords.new);
                        return (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${strength >= level * 25
                              ? strength >= 75
                                ? 'bg-success'
                                : strength >= 50
                                  ? 'bg-warning'
                                  : 'bg-error'
                              : 'bg-base-300'
                              }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-base-content/40 flex items-center gap-1">
                      <RiInformationLine size={10} />
                      {getPasswordStrength(passwords.new) < 50 && t('profile.weakPassword')}
                      {getPasswordStrength(passwords.new) >= 50 && getPasswordStrength(passwords.new) < 75 && t('profile.mediumPassword')}
                      {getPasswordStrength(passwords.new) >= 75 && t('profile.strongPassword')}
                    </p>
                  </div>
                )}

                <button
                  className="btn btn-warning gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-warning/25"
                  onClick={changePassword}
                  disabled={saving || !passwords.current || !passwords.new}
                >
                  <RiLockPasswordLine size={16} />
                  {t('profile.changePasswordButton')}
                </button>
              </div>
            </Section>
          </div>
        );

      // ── Notifications ────────────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-8">
            <Section
              title={t('notifications.emailTitle')}
              description={t('notifications.emailDescription')}
              gradient="from-accent to-primary"
            >
              <div className="space-y-4">
                <div className="form-control group">
                  <label className="label">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                      <RiMailLine size={12} className="text-primary" />
                      {t('notifications.notificationEmail')}
                    </span>
                  </label>
                  <div className="relative">
                    <RiMailLine
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
                      size={15}
                    />
                    <input
                      type="email"
                      className="input input-bordered w-full bg-base-200/30 pl-9 focus:border-primary transition-all duration-300"
                      value={notifications.notificationEmail}
                      onChange={(e) =>
                        setNotifications((p) => ({ ...p, notificationEmail: e.target.value }))
                      }
                      placeholder={t('notifications.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="divide-y divide-base-300/50 bg-base-200/20 rounded-xl overflow-hidden">
                  <Toggle
                    label={t('notifications.newBreach')}
                    description={t('notifications.newBreachDesc')}
                    checked={notifications.emailOnNewBreach}
                    onChange={(v) => setNotifications((p) => ({ ...p, emailOnNewBreach: v }))}
                    gradient="from-primary to-secondary"
                  />
                  <Toggle
                    label={t('notifications.scanComplete')}
                    description={t('notifications.scanCompleteDesc')}
                    checked={notifications.emailOnScanComplete}
                    onChange={(v) => setNotifications((p) => ({ ...p, emailOnScanComplete: v }))}
                    gradient="from-secondary to-accent"
                  />
                  <Toggle
                    label={t('notifications.highRisk')}
                    description={t('notifications.highRiskDesc')}
                    checked={notifications.emailOnHighRisk}
                    onChange={(v) => setNotifications((p) => ({ ...p, emailOnHighRisk: v }))}
                    gradient="from-accent to-primary"
                  />
                  <Toggle
                    label={t('notifications.weeklyDigest')}
                    description={t('notifications.weeklyDigestDesc')}
                    checked={notifications.weeklyDigest}
                    onChange={(v) => setNotifications((p) => ({ ...p, weeklyDigest: v }))}
                    gradient="from-primary to-accent"
                  />
                </div>
              </div>
            </Section>

            <Section
              title={t('notifications.inAppTitle')}
              description={t('notifications.inAppDescription')}
              gradient="from-secondary to-primary"
            >
              <div className="divide-y divide-base-300/50 bg-base-200/20 rounded-xl overflow-hidden">
                <Toggle
                  label={t('notifications.showBreachAlerts')}
                  description={t('notifications.showBreachAlertsDesc')}
                  checked={notifications.toastOnNewBreach}
                  onChange={(v) => setNotifications((p) => ({ ...p, toastOnNewBreach: v }))}
                  gradient="from-primary to-secondary"
                />
                <Toggle
                  label={t('notifications.showScanCompletion')}
                  description={t('notifications.showScanCompletionDesc')}
                  checked={notifications.toastOnScanComplete}
                  onChange={(v) => setNotifications((p) => ({ ...p, toastOnScanComplete: v }))}
                  gradient="from-secondary to-accent"
                />
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="btn btn-primary flex-1 bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                onClick={saveNotifications}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <RiSaveLine size={16} />
                )}
                {t('notifications.saveButton')}
              </button>
              <button
                className="btn btn-outline flex-1 gap-2 transition-all duration-300 hover:scale-[1.02]"
                onClick={async () => {
                  setSaving(true);
                  try {
                    await post('/settings/email/test', { email: notifications.notificationEmail });
                    toast.success(locale === 'ar' ? 'تم إرسال بريد الاختبار بنجاح!' : 'Test email sent successfully!');
                  } catch (err: any) {
                    toast.error(err.message || (locale === 'ar' ? 'فشل في إرسال بريد الاختبار' : 'Failed to send test email'));
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <RiMailLine size={16} />
                {locale === 'ar' ? 'اختبار البريد' : 'Test Email'}
              </button>
            </div>
          </div>
        );

      // ── Schedule ─────────────────────────────────────────────────────────────
      case 'schedule':
        return (
          <Section
            title={t('schedule.title')}
            description={t('schedule.description')}
            gradient="from-primary to-accent"
          >
            <div className="space-y-6">
              {/* Enable Toggle */}
              <div className="relative group overflow-hidden bg-linear-to-br from-primary/5 to-secondary/5 rounded-xl p-4">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-primary to-accent" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base-content flex items-center gap-2">
                      <RiRadarLine className="text-primary" size={18} />
                      {t('schedule.enableAutoScan')}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">
                      {t('schedule.enableAutoScanDesc')}
                    </p>
                  </div>
                  <div className="relative">
                    <div
                      className={`w-14 h-7 rounded-full transition-all duration-300 cursor-pointer ${schedule.autoScanEnabled ? 'bg-linear-to-r from-primary to-accent' : 'bg-base-300'}`}
                      onClick={() => setSchedule((p) => ({ ...p, autoScanEnabled: !p.autoScanEnabled }))}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${schedule.autoScanEnabled ? 'left-8' : 'left-1'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`space-y-4 transition-all duration-300 ${schedule.autoScanEnabled ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2 pointer-events-none'
                  }`}
              >
                {/* Frequency */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">
                      {t('schedule.frequency')}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'manual'] as const).map((f) => (
                      <button
                        key={f}
                        className={`btn btn-sm flex-1 capitalize transition-all duration-300 ${schedule.frequency === f
                          ? 'btn-primary bg-linear-to-r from-primary to-accent border-0 text-white shadow-lg'
                          : ' border border-base-300 hover:border-primary/30'
                          }`}
                        onClick={() => setSchedule((p) => ({ ...p, frequency: f }))}
                      >
                        {t(`schedule.${f}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                {schedule.frequency !== 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">
                          {t('schedule.scanTime')}
                        </span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered bg-base-200/30 focus:border-primary transition-all duration-300"
                        value={schedule.scanTime}
                        onChange={(e) =>
                          setSchedule((p) => ({ ...p, scanTime: e.target.value }))
                        }
                      />
                    </div>
                    {schedule.frequency === 'weekly' && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">
                            {t('schedule.dayOfWeek')}
                          </span>
                        </label>
                        <select
                          className="select select-bordered bg-base-200/30 focus:border-primary transition-all duration-300"
                          value={schedule.scanDay}
                          onChange={(e) =>
                            setSchedule((p) => ({ ...p, scanDay: e.target.value }))
                          }
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                            (d, i) => (
                              <option key={d} value={d} className="capitalize">
                                {daysOfWeek[i]}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan Types */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">
                      {t('schedule.includeScanTypes')}
                    </span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {SCAN_TYPES.map((type, index) => (
                      <label
                        key={type.id}
                        className="group relative flex items-center gap-3 p-4 rounded-xl border border-base-300 cursor-pointer hover:border-primary/30 transition-all duration-200 animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={schedule.scanTypes.includes(type.id)}
                          onChange={() => toggleScanType(type.id)}
                        />
                        <span className="text-sm flex-1">{t(type.labelKey)}</span>
                        {schedule.scanTypes.includes(type.id) && (
                          <RiCheckLine className="text-primary animate-scale-in" size={16} />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {schedule.autoScanEnabled && schedule.frequency !== 'manual' && (
                  <div className="relative overflow-hidden bg-linear-to-br from-info/10 to-info/5 rounded-xl p-4 border border-info/20">
                    <div className="absolute inset-0 bg-linear-to-r from-info/5 to-transparent" />
                    <div className="relative flex items-center gap-3">
                      <RiTimerLine className="text-info" size={20} />
                      <div>
                        <p className="text-sm text-info/90">
                          {t('schedule.nextScan')}{' '}
                          <strong>
                            {schedule.frequency === 'daily'
                              ? `${t('schedule.everyDayAt')} ${schedule.scanTime}`
                              : `${t('schedule.everyAt')} ${daysOfWeek[['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(schedule.scanDay)]} ${t('schedule.at')} ${schedule.scanTime}`}
                          </strong>
                        </p>
                        <p className="text-xs text-info/70 mt-1">
                          {schedule.scanTypes.length} {t('schedule.scanTypesSelected')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary w-full bg-linear-to-r from-primary to-accent border-0 hover:from-primary-focus hover:to-accent-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                onClick={saveSchedule}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <RiSaveLine size={16} />
                )}
                {t('schedule.saveButton')}
              </button>
            </div>
          </Section>
        );

      // ── Security ─────────────────────────────────────────────────────────────
      case 'security':
        const securityItems = securityData ? [
          {
            label: t('security.twoFactor'),
            status: securityData.twoFactorEnabled ? t('security.twoFactorEnabled') : t('security.twoFactorNotEnabled'),
            ok: securityData.twoFactorEnabled,
            note: securityData.twoFactorEnabled ? t('security.twoFactorProtected') : t('security.twoFactorEnhance'),
            icon: RiShieldKeyholeLine,
            action: !securityData.twoFactorEnabled ? () => toggle2FA(true) : undefined
          },
          {
            label: t('security.jwtToken'),
            status: t('security.jwtActive'),
            ok: true,
            note: t('security.jwtAutoRenewed'),
            icon: RiShieldLine
          },
          {
            label: t('security.passwordStrength'),
            status: securityData.passwordStrength || (locale === 'ar' ? 'قوية' : 'Strong'),
            ok: true,
            note: `${t('security.lastChanged')} ${formatLastActivity(securityData.lastPasswordChange)}`,
            icon: RiLockPasswordLine
          },
          {
            label: t('security.rateLimiting'),
            status: securityData.isLocked ? t('security.accountLocked') : (locale === 'ar' ? 'نشط' : 'Active'),
            ok: !securityData.isLocked,
            note: securityData.isLocked
              ? t('security.tooManyAttempts')
              : t('security.activeProtection'),
            icon: RiTimerLine
          },
          {
            label: t('security.corsProtection'),
            status: locale === 'ar' ? 'نشط' : 'Active',
            ok: true,
            note: t('security.corsWhitelist'),
            icon: RiGlobalLine
          },
        ] : [];

        return (
          <div className="space-y-6">
            <Section
              title={t('security.title')}
              description={t('security.description')}
              gradient="from-secondary to-primary"
            >
              {securityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {securityItems.map((item, index) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden bg-base-200/30 rounded-xl p-4 hover:bg-base-200/50 transition-all duration-200 animate-slide-in cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={item.action}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-primary to-secondary" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-${item.ok ? 'success' : 'warning'}/10 flex items-center justify-center`}>
                            <item.icon className={`text-${item.ok ? 'success' : 'warning'}`} size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-base-content">{item.label}</p>
                            <p className="text-xs text-base-content/40">{item.note}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/50">{item.status}</span>
                          {item.ok ? (
                            <RiCheckLine className="text-success" size={18} />
                          ) : (
                            <RiAlertLine className="text-warning" size={18} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title={t('security.activeSessions')} description={t('security.activeSessionsDesc')}>
              {securityLoading ? (
                <div className="flex items-center justify-center py-4">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : securityData?.activeSessions && securityData.activeSessions.length > 0 ? (
                <div className="space-y-3">
                  {securityData.activeSessions.map((session, index) => (
                    <div
                      key={session.sessionId}
                      className="group relative overflow-hidden bg-base-200/30 rounded-xl p-4 hover:bg-base-200/50 transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-primary to-secondary" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${session.isCurrent ? 'bg-success/10' : 'bg-base-300/50'} flex items-center justify-center`}>
                            {getDeviceIcon(session.userAgent)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-base-content flex items-center gap-2">
                              {session.userAgent.split(' ')[0] || t('security.browser')}
                              {session.isCurrent && (
                                <span className="badge badge-success badge-xs">{t('security.current')}</span>
                              )}
                            </p>
                            <p className="text-xs text-base-content/40 flex items-center gap-2 mt-0.5">
                              <RiMapPinLine size={10} />
                              {session.ipAddress}
                              <span className="text-base-content/20">•</span>
                              <RiTimeLine size={10} />
                              {formatLastActivity(session.lastActivity)}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          {session.isCurrent ? (
                            <>
                              <span className="absolute inset-0 bg-success/20 rounded-full blur-md animate-pulse" />
                              <span className="relative badge badge-success badge-sm">{t('security.active')}</span>
                            </>
                          ) : (
                            <span className="badge badge-ghost badge-sm">{formatLastActivity(session.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="group relative overflow-hidden bg-base-200/30 rounded-xl p-4">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-primary to-secondary" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <RiComputerLine className="text-success" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-base-content">{locale === 'ar' ? 'الجلسة الحالية' : 'Current Session'}</p>
                        <p className="text-xs text-base-content/40 flex items-center gap-1 mt-0.5">
                          <RiTimeLine size={10} />
                          {t('security.browser')} — {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-0 bg-success/20 rounded-full blur-md animate-pulse" />
                      <span className="relative badge badge-success badge-sm">{t('security.active')}</span>
                    </div>
                  </div>
                </div>
              )}
              <button
                className="btn btn-error w-full gap-2 transition-all duration-300 transform hover:scale-[1.02] mt-3"
                onClick={revokeAllSessions}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <RiRefreshLine size={14} />
                )}
                {t('security.revokeSessions')}
              </button>
            </Section>

            <Section title={t('security.apiAccess')} description={t('security.apiAccessDesc')}>
              <div className="relative overflow-hidden bg-linear-to-br from-warning/10 to-warning/5 rounded-xl p-6 border border-warning/20">
                <div className="absolute inset-0 bg-linear-to-r from-warning/5 to-transparent" />
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <RiAlertLine className="text-warning" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warning/90">{t('security.comingSoon')}</p>
                    <p className="text-xs text-warning/70 mt-1">
                      {t('security.apiComingSoon')}
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        );

      // ── Appearance ────────────────────────────────────────────────────────────
      case 'appearance':
        return (
          <Section
            title={t('appearance.title')}
            description={t('appearance.description')}
            gradient="from-accent to-secondary"
          >
            <div className="space-y-8">
              {/* Theme */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-4 flex items-center gap-1">
                  <RiGlobalLine size={12} className="text-accent" />
                  {t('appearance.theme')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'dark', label: t('appearance.darkMode'), emoji: '🌙', active: isDark, gradient: 'from-primary to-secondary' },
                    { id: 'light', label: t('appearance.lightMode'), emoji: '☀️', active: !isDark, gradient: 'from-secondary to-accent' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={toggleTheme}
                      className={`group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${theme.active
                        ? `border-primary bg-linear-to-br ${theme.gradient}`
                        : 'border-base-300 hover:border-base-content/30'
                        }`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-primary to-secondary" />
                      <div className="relative text-center">
                        <span className="text-4xl mb-2 block animate-float">{theme.emoji}</span>
                        <p className="text-sm font-medium text-base-content">{theme.label}</p>
                        {theme.active && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute h-2 w-2 rounded-full bg-primary opacity-75" />
                              <span className="relative rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <p className="text-xs text-primary">{t('appearance.currentlyActive')}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-4 flex items-center gap-1">
                  <RiGlobalLine size={12} className="text-secondary" />
                  {t('appearance.language')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: 'en', label: 'English', dir: t('appearance.ltr'), flag: '🇺🇸', active: locale === 'en' },
                    { code: 'ar', label: 'العربية', dir: t('appearance.rtl'), flag: '🇸🇦', active: locale === 'ar' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        const segments = window.location.pathname.split('/');
                        segments[1] = lang.code;
                        window.location.href = segments.join('/');
                      }}
                      className={`group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${lang.active
                        ? 'border-secondary bg-linear-to-br from-secondary/20 to-accent/20'
                        : 'border-base-300 hover:border-base-content/30'
                        }`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-r from-secondary to-accent" />
                      <div className="relative text-center">
                        <span className="text-4xl mb-2 block animate-float animation-delay-2000">{lang.flag}</span>
                        <p className="text-sm font-medium text-base-content">{lang.label}</p>
                        <p className="text-xs text-base-content/40 mt-1">{lang.dir}</p>
                        {lang.active && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute h-2 w-2 rounded-full bg-secondary opacity-75" />
                              <span className="relative rounded-full h-2 w-2 bg-secondary" />
                            </span>
                            <p className="text-xs text-secondary">{t('appearance.currentlyActive')}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* About */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-4 flex items-center gap-1">
                  <RiInformationLine size={12} className="text-primary" />
                  {t('appearance.about')}
                </p>
                <div className="relative overflow-hidden bg-linear-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-base-300/50">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent" />
                  <div className="relative space-y-4 text-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-base-300/30">
                      <span className="text-base-content/50 flex items-center gap-2">
                        <RiShieldLine size={14} className="text-primary" />
                        {t('appearance.version')}
                      </span>
                      <span className="font-mono font-bold text-primary">1.0.0-MVP</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-base-300/30">
                      <span className="text-base-content/50 flex items-center gap-2">
                        <RiRadarLine size={14} className="text-secondary" />
                        {t('appearance.stack')}
                      </span>
                      <span className="text-sm">Next.js 14 + Express + MongoDB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/50 flex items-center gap-2">
                        <RiTimerLine size={14} className="text-accent" />
                        {t('appearance.phase')}
                      </span>
                      <span className="badge badge-primary badge-lg bg-linear-to-r from-primary to-secondary">
                        Phase 1 — MVP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        );

      default:
        return null;
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 p-4 md:p-6 lg:p-8">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />

      <div className="relative max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
          <div className="pl-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-xl blur-md opacity-50 animate-pulse" />
                <div className="relative w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <RiSettings3Line className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-sm text-base-content/50 mt-1 flex items-center gap-2">
                  <RiInformationLine size={14} className="text-primary/50" />
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Quick Save Indicator */}
            {saving && (
              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20">
                <span className="loading loading-spinner loading-xs text-success" />
                <span className="text-xs text-success">{t('saving')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <nav className="lg:w-64 space-y-1">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative w-full transition-all duration-300 animate-slide-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${activeTab === tab.id
                  ? `bg-linear-to-r ${tab.gradient} opacity-100`
                  : 'hover:bg-base-200/50'
                  }`} />
                <div className={`relative flex items-center gap-3 px-4 py-3 ${activeTab === tab.id ? 'text-white' : 'text-base-content/60'
                  }`}>
                  <span className={`transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                    {tab.icon}
                  </span>
                  <span className="text-sm font-medium flex-1 text-left">{t(tab.labelKey)}</span>
                  {activeTab === tab.id && (
                    <RiArrowRightLine size={14} className="animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1">
            <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl">
              <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${currentTab.gradient}`} />
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br ${currentTab.gradient}`} />

              <div className="relative p-6 md:p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('trustBadges.enterpriseSecurity')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiRadarLine size={14} className="text-secondary/50" />
            {t('trustBadges.realtimeUpdates')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiTimeLine size={14} className="text-accent/50" />
            {t('trustBadges.instantSync')}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
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