'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  RiShieldLine,
  RiBuildingLine,
  RiUserLine,
  RiScanLine,
  RiSettings4Line,
  RiHistoryLine,
  RiNotificationLine,
  RiFlagLine,
  RiServerLine,
  RiDatabaseLine,
  RiRefreshLine,
  RiSearchLine,
  RiFilterLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiKeyLine,
  RiLockLine,
  RiLockUnlockLine,
  RiEyeLine,
  RiMailLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiCloseLine,
  RiFileCopyLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiDashboardLine,
  RiUserSettingsLine,
  RiGlobalLine,
  RiOrganizationChart,
  RiFileTextLine,
  RiBarChartBoxLine,
  RiToggleLine,
  RiSendPlaneLine,
  RiPulseLine,
  RiCpuLine,
  RiHardDriveLine,
  RiTimerLine,
  RiCheckDoubleLine,
  RiUserReceivedLine,
  RiAdminLine,
  RiVipCrownLine,
  RiFlashlightLine,
  RiDownloadLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import { get, post, put, del } from '../../../../utils/apiClient';
import useSWR from 'swr';
import { formatDate } from '@shared/utils';
import { useAuth } from '../../../../components/providers/AuthProvider';

// Types
interface Company {
  _id: string;
  name: string;
  domain: string;
  emailDomains: string[];
  createdAt: string;
  userCount: number;
  scanCount: number;
  breachCount: number;
  riskScore: number;
  riskCategory: string;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId: {
    _id: string;
    name: string;
    domain: string;
  };
  twoFactorEnabled: boolean;
  createdAt: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
}

interface SystemHealth {
  database: { status: string; type: string };
  queue: { pending: number; active: number; completed: number; failed: number };
  system: {
    uptime: number;
    memory: { heapUsed: number; heapTotal: number; rss: number };
    nodeVersion: string;
    platform: string;
  };
}

interface OverviewStats {
  totalCompanies: number;
  totalUsers: number;
  totalScans: number;
  totalBreaches: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
}

type TabType = 'overview' | 'companies' | 'users' | 'statistics' | 'features' | 'notifications' | 'audit' | 'health';

export default function SuperAdminPage() {
  const t = useTranslations('superAdmin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    if (user.role !== 'super-admin') {
      toast.error(isRTL ? 'غير مصرح لك بالدخول لهذه الصفحة' : 'You are not authorized to access this page');
      router.replace(`/${locale}/dashboard`);
    }
  }, [isLoading, user, router, locale, isRTL]);

  if (isLoading || !user || user.role !== 'super-admin') {
    return (
      <div className="min-h-screen grid place-items-center bg-base-200/30">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modals
  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'company' | 'user'; id: string; name: string } | null>(null);

  // Edit forms
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '', emailDomains: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'user' });

  // Data fetching
  const { data: overview, mutate: mutateOverview } = useSWR<OverviewStats>('/super-admin/overview', (url) => get<OverviewStats>(url));
  const { data: companies, mutate: mutateCompanies } = useSWR<Company[]>('/super-admin/companies', (url) => get<Company[]>(url));
  const { data: users, mutate: mutateUsers } = useSWR<User[]>('/super-admin/users', (url) => get<User[]>(url));
  const { data: featureFlags, mutate: mutateFlags } = useSWR<FeatureFlag[]>('/super-admin/feature-flags', (url) => get<FeatureFlag[]>(url));
  const { data: health, mutate: mutateHealth } = useSWR<SystemHealth>('/super-admin/health', (url) => get<SystemHealth>(url));

  // Handlers
  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanyForm({
      name: company.name,
      domain: company.domain,
      emailDomains: company.emailDomains?.join(', ') || '',
    });
    setEditCompanyModal(true);
  };

  const handleSaveCompany = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      await put(`/super-admin/companies/${selectedCompany._id}`, {
        name: companyForm.name,
        domain: companyForm.domain,
        emailDomains: companyForm.emailDomains.split(',').map(d => d.trim()).filter(Boolean),
      });
      toast.success(t('companyUpdated'));
      setEditCompanyModal(false);
      mutateCompanies();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendCompany = async (companyId: string) => {
    try {
      await post(`/super-admin/companies/${companyId}/suspend`, { reason: 'Suspended by super-admin' });
      toast.success(t('companySuspended'));
      mutateCompanies();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleActivateCompany = async (companyId: string) => {
    try {
      await post(`/super-admin/companies/${companyId}/activate`, {});
      toast.success(t('companyActivated'));
      mutateCompanies();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/super-admin/companies/${deleteTarget.id}`);
      toast.success(t('companyDeleted'));
      setConfirmDeleteModal(false);
      setDeleteTarget(null);
      mutateCompanies();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await put(`/super-admin/users/${selectedUser._id}`, userForm);
      toast.success(t('userUpdated'));
      setEditUserModal(false);
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await post<{ tempPassword: string }>(`/super-admin/users/${userId}/reset-password`, {});
      setTempPassword(response.tempPassword);
      setPasswordModal(true);
      toast.success(t('passwordReset'));
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    try {
      await post(`/super-admin/users/${userId}/revoke-sessions`, {});
      toast.success(t('sessionsRevoked'));
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/super-admin/users/${deleteTarget.id}`);
      toast.success(t('userDeleted'));
      setConfirmDeleteModal(false);
      setDeleteTarget(null);
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const handleToggleFeature = async (flagId: string, enabled: boolean) => {
    try {
      await put(`/super-admin/feature-flags/${flagId}`, { enabled });
      toast.success(t('featureUpdated'));
      mutateFlags();
    } catch (err: any) {
      toast.error(err.message || t('error'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copied'));
  };

  // Filtered data
  const filteredCompanies = companies?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users?.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Helpers
  const getRiskColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'low': return 'text-success';
      case 'medium': return 'text-info';
      case 'high': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-base-content/50';
    }
  };

  const getRiskBadge = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-info';
      case 'high': return 'badge-warning';
      case 'critical': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (isRTL) {
      return `${days} يوم، ${hours} ساعة، ${mins} دقيقة`;
    }
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatMemory = (mb: number) => `${mb} MB`;

  // Tab config
  const tabs = [
    { id: 'overview' as TabType, icon: RiDashboardLine, label: t('tabs.overview') },
    { id: 'companies' as TabType, icon: RiBuildingLine, label: t('tabs.companies') },
    { id: 'users' as TabType, icon: RiUserLine, label: t('tabs.users') },
    { id: 'statistics' as TabType, icon: RiBarChartBoxLine, label: t('tabs.statistics') },
    { id: 'features' as TabType, icon: RiToggleLine, label: t('tabs.features') },
    { id: 'notifications' as TabType, icon: RiNotificationLine, label: t('tabs.notifications') },
    { id: 'audit' as TabType, icon: RiHistoryLine, label: t('tabs.audit') },
    { id: 'health' as TabType, icon: RiServerLine, label: t('tabs.health') },
  ];

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-warning to-error rounded-xl flex items-center justify-center shadow-lg">
              <RiVipCrownLine className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-warning to-error bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-sm text-base-content/50">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-base-100/80 backdrop-blur-sm rounded-2xl p-2 border border-base-300/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-linear-to-r from-warning to-error text-white shadow-md'
                  : 'hover:bg-base-200/50 text-base-content/70'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 border border-base-300/50 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <RiBuildingLine className="text-primary" size={20} />
                    </div>
                    <span className="text-xs text-base-content/50">{t('totalCompanies')}</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{overview?.totalCompanies || 0}</p>
                </div>
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 border border-base-300/50 hover:border-secondary/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <RiUserLine className="text-secondary" size={20} />
                    </div>
                    <span className="text-xs text-base-content/50">{t('totalUsers')}</span>
                  </div>
                  <p className="text-3xl font-bold text-secondary">{overview?.totalUsers || 0}</p>
                </div>
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 border border-base-300/50 hover:border-accent/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <RiScanLine className="text-accent" size={20} />
                    </div>
                    <span className="text-xs text-base-content/50">{t('totalScans')}</span>
                  </div>
                  <p className="text-3xl font-bold text-accent">{overview?.totalScans || 0}</p>
                </div>
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-5 border border-base-300/50 hover:border-error/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
                      <RiAlertLine className="text-error" size={20} />
                    </div>
                    <span className="text-xs text-base-content/50">{t('totalBreaches')}</span>
                  </div>
                  <p className="text-3xl font-bold text-error">{overview?.totalBreaches || 0}</p>
                </div>
              </div>

              {/* Active Scans & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RiPulseLine className="text-info" />
                    {t('scanActivity')}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-info/5 rounded-xl">
                      <p className="text-3xl font-bold text-info">{overview?.activeScans || 0}</p>
                      <p className="text-xs text-base-content/50 mt-1">{t('activeScans')}</p>
                    </div>
                    <div className="text-center p-4 bg-success/5 rounded-xl">
                      <p className="text-3xl font-bold text-success">{overview?.completedScans || 0}</p>
                      <p className="text-xs text-base-content/50 mt-1">{t('completedScans')}</p>
                    </div>
                    <div className="text-center p-4 bg-error/5 rounded-xl">
                      <p className="text-3xl font-bold text-error">{overview?.failedScans || 0}</p>
                      <p className="text-xs text-base-content/50 mt-1">{t('failedScans')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RiFlashlightLine className="text-warning" />
                    {t('quickActions')}
                  </h3>
                  <div className="space-y-2">
                    <button className="btn btn-sm btn-ghost w-full justify-start gap-2">
                      <RiSendPlaneLine size={16} />
                      {t('broadcastMessage')}
                    </button>
                    <button className="btn btn-sm btn-ghost w-full justify-start gap-2">
                      <RiScanLine size={16} />
                      {t('runGlobalScan')}
                    </button>
                    <button className="btn btn-sm btn-ghost w-full justify-start gap-2">
                      <RiDownloadLine size={16} />
                      {t('exportData')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Companies */}
              <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <RiBuildingLine className="text-primary" />
                    {t('recentCompanies')}
                  </h3>
                  <button 
                    onClick={() => setActiveTab('companies')}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('viewAll')}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('company')}</th>
                        <th>{t('domain')}</th>
                        <th>{t('users')}</th>
                        <th>{t('riskScore')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies?.slice(0, 5).map(company => (
                        <tr key={company._id} className="hover">
                          <td className="font-medium">{company.name}</td>
                          <td className="font-mono text-sm text-base-content/60">{company.domain}</td>
                          <td>{company.userCount}</td>
                          <td>
                            <span className={`badge badge-sm ${getRiskBadge(company.riskCategory)}`}>
                              {company.riskScore}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success badge-sm">{company.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 overflow-hidden">
              <div className="p-6 border-b border-base-300/50">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <RiBuildingLine className="text-primary" />
                    {t('manageCompanies')}
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={16} />
                      <input
                        type="text"
                        placeholder={t('searchCompanies')}
                        className="input input-sm input-bordered pl-9 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => mutateCompanies()}
                      className="btn btn-sm btn-square"
                    >
                      <RiRefreshLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>{t('company')}</th>
                      <th>{t('domain')}</th>
                      <th>{t('users')}</th>
                      <th>{t('scans')}</th>
                      <th>{t('breaches')}</th>
                      <th>{t('risk')}</th>
                      <th>{t('status')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies?.map(company => (
                      <tr key={company._id} className="hover group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                              <RiBuildingLine size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-xs text-base-content/40">{formatDate(company.createdAt, locale as 'en' | 'ar')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-sm">{company.domain}</td>
                        <td>
                          <span className="badge badge-ghost badge-sm">{company.userCount}</span>
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-sm">{company.scanCount}</span>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${company.breachCount > 0 ? 'badge-error' : 'badge-ghost'}`}>
                            {company.breachCount}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getRiskColor(company.riskCategory)}`}>
                              {company.riskScore}
                            </span>
                            <span className={`badge badge-xs ${getRiskBadge(company.riskCategory)}`}>
                              {company.riskCategory}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${company.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                            {company.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEditCompany(company)}
                              className="btn btn-xs btn-ghost btn-square"
                            >
                              <RiEditLine size={14} />
                            </button>
                            {company.status === 'active' ? (
                              <button 
                                onClick={() => handleSuspendCompany(company._id)}
                                className="btn btn-xs btn-ghost btn-square text-warning"
                              >
                                <RiLockLine size={14} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleActivateCompany(company._id)}
                                className="btn btn-xs btn-ghost btn-square text-success"
                              >
                                <RiLockUnlockLine size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setDeleteTarget({ type: 'company', id: company._id, name: company.name });
                                setConfirmDeleteModal(true);
                              }}
                              className="btn btn-xs btn-ghost btn-square text-error"
                            >
                              <RiDeleteBinLine size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 overflow-hidden">
              <div className="p-6 border-b border-base-300/50">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <RiUserLine className="text-secondary" />
                    {t('manageUsers')}
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={16} />
                      <input
                        type="text"
                        placeholder={t('searchUsers')}
                        className="input input-sm input-bordered pl-9 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="select select-sm select-bordered"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                      <option value="super-admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                    <button 
                      onClick={() => mutateUsers()}
                      className="btn btn-sm btn-square"
                    >
                      <RiRefreshLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>{t('user')}</th>
                      <th>{t('company')}</th>
                      <th>{t('role')}</th>
                      <th>{t('2fa')}</th>
                      <th>{t('joined')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map(user => (
                      <tr key={user._id} className="hover group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              user.role === 'super-admin' ? 'bg-linear-to-br from-warning to-error' :
                              user.role === 'admin' ? 'bg-linear-to-br from-primary to-secondary' :
                              'bg-base-200'
                            }`}>
                              <span className="text-xs font-bold text-white">
                                {user.name[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-base-content/40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <RiBuildingLine size={14} className="text-base-content/30" />
                            <span className="text-sm">{user.companyId?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${
                            user.role === 'super-admin' ? 'badge-warning' :
                            user.role === 'admin' ? 'badge-primary' : 'badge-ghost'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.twoFactorEnabled ? (
                            <span className="badge badge-success badge-xs gap-1">
                              <RiCheckboxCircleLine size={10} />
                              {isRTL ? 'مفعل' : 'On'}
                            </span>
                          ) : (
                            <span className="badge badge-ghost badge-xs">{isRTL ? 'معطل' : 'Off'}</span>
                          )}
                        </td>
                        <td className="text-sm text-base-content/60">
                          {formatDate(user.createdAt, locale as 'en' | 'ar')}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="btn btn-xs btn-ghost btn-square"
                            >
                              <RiEditLine size={14} />
                            </button>
                            <button 
                              onClick={() => handleResetPassword(user._id)}
                              className="btn btn-xs btn-ghost btn-square text-info"
                              title={t('resetPassword')}
                            >
                              <RiKeyLine size={14} />
                            </button>
                            <button 
                              onClick={() => handleRevokeSessions(user._id)}
                              className="btn btn-xs btn-ghost btn-square text-warning"
                              title={t('revokeSessions')}
                            >
                              <RiLogoutBoxRLine size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setDeleteTarget({ type: 'user', id: user._id, name: user.name });
                                setConfirmDeleteModal(true);
                              }}
                              className="btn btn-xs btn-ghost btn-square text-error"
                            >
                              <RiDeleteBinLine size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feature Flags Tab */}
          {activeTab === 'features' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 overflow-hidden">
              <div className="p-6 border-b border-base-300/50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RiToggleLine className="text-accent" />
                  {t('featureFlags')}
                </h3>
                <p className="text-sm text-base-content/50 mt-1">{t('featureFlagsDesc')}</p>
              </div>
              <div className="divide-y divide-base-300/50">
                {featureFlags?.map(flag => (
                  <div key={flag.id} className="p-4 flex items-center justify-between hover:bg-base-200/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flag.enabled ? 'bg-success/10' : 'bg-base-200'}`}>
                        <RiToggleLine className={flag.enabled ? 'text-success' : 'text-base-content/30'} size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{flag.name}</p>
                        <p className="text-sm text-base-content/50">{flag.description}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer label">
                      <input 
                        type="checkbox" 
                        className="toggle toggle-success"
                        checked={flag.enabled}
                        onChange={(e) => handleToggleFeature(flag.id, e.target.checked)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Health Tab */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Status */}
              <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RiDatabaseLine className="text-primary" />
                  {t('database')}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${health?.database?.status === 'healthy' ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
                  <span className="font-medium capitalize">{health?.database?.status || 'Unknown'}</span>
                  <span className="badge badge-ghost badge-sm">{health?.database?.type}</span>
                </div>
              </div>

              {/* Queue Status */}
              <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RiTimerLine className="text-secondary" />
                  {t('jobQueue')}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-3 bg-base-200/50 rounded-xl">
                    <p className="text-2xl font-bold">{health?.queue?.pending || 0}</p>
                    <p className="text-xs text-base-content/50">{t('pending')}</p>
                  </div>
                  <div className="text-center p-3 bg-info/10 rounded-xl">
                    <p className="text-2xl font-bold text-info">{health?.queue?.active || 0}</p>
                    <p className="text-xs text-base-content/50">{t('active')}</p>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-xl">
                    <p className="text-2xl font-bold text-success">{health?.queue?.completed || 0}</p>
                    <p className="text-xs text-base-content/50">{t('completed')}</p>
                  </div>
                  <div className="text-center p-3 bg-error/10 rounded-xl">
                    <p className="text-2xl font-bold text-error">{health?.queue?.failed || 0}</p>
                    <p className="text-xs text-base-content/50">{t('failed')}</p>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RiCpuLine className="text-accent" />
                  {t('systemResources')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">{t('uptime')}</p>
                    <p className="font-mono font-bold">{formatUptime(health?.system?.uptime || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">{t('heapUsed')}</p>
                    <p className="font-mono font-bold">{formatMemory(health?.system?.memory?.heapUsed || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">{t('heapTotal')}</p>
                    <p className="font-mono font-bold">{formatMemory(health?.system?.memory?.heapTotal || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">{t('nodeVersion')}</p>
                    <p className="font-mono font-bold">{health?.system?.nodeVersion}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-base-content/50 mb-2">{t('memoryUsage')}</p>
                  <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((health?.system?.memory?.heapUsed || 0) / (health?.system?.memory?.heapTotal || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RiBarChartBoxLine className="text-primary" />
                {t('platformStatistics')}
              </h3>
              <p className="text-base-content/50">{t('comingSoon')}</p>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RiNotificationLine className="text-warning" />
                {t('broadcastNotifications')}
              </h3>
              <p className="text-base-content/50">{t('comingSoon')}</p>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RiHistoryLine className="text-info" />
                {t('auditLog')}
              </h3>
              <p className="text-base-content/50">{t('comingSoon')}</p>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30">
            <RiVipCrownLine size={14} className="text-warning/50" />
            {t('superAdminAccess')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('fullAccess')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30">
            <RiHistoryLine size={14} className="text-secondary/50" />
            {t('auditTrail')}
          </span>
        </div>
      </div>

      {/* Edit Company Modal */}
      {editCompanyModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <RiBuildingLine className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('editCompany')}</h3>
              </div>
              <button className="btn btn-sm btn-circle" onClick={() => setEditCompanyModal(false)}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('companyName')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('domain')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered font-mono"
                  value={companyForm.domain}
                  onChange={(e) => setCompanyForm(p => ({ ...p, domain: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('emailDomains')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder={isRTL ? 'domain1.com, domain2.com' : 'domain1.com, domain2.com'}
                  value={companyForm.emailDomains}
                  onChange={(e) => setCompanyForm(p => ({ ...p, emailDomains: e.target.value }))}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">{t('commaSeparated')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn flex-1" onClick={() => setEditCompanyModal(false)}>
                {t('cancel')}
              </button>
              <button 
                className="btn btn-primary flex-1" 
                onClick={handleSaveCompany}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <RiUserLine className="text-secondary" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('editUser')}</h3>
              </div>
              <button className="btn btn-sm btn-circle" onClick={() => setEditUserModal(false)}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('userName')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={userForm.name}
                  onChange={(e) => setUserForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('email')}</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={userForm.email}
                  onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('role')}</span>
                </label>
                <select
                  className="select select-bordered"
                  value={userForm.role}
                  onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn flex-1" onClick={() => setEditUserModal(false)}>
                {t('cancel')}
              </button>
              <button 
                className="btn btn-primary flex-1" 
                onClick={handleSaveUser}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <RiKeyLine className="text-success" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('passwordReset')}</h3>
              </div>
              <button className="btn btn-sm btn-circle" onClick={() => setPasswordModal(false)}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="bg-base-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-base-content/50 mb-1">{t('newPassword')}</p>
              <div className="flex items-center gap-2">
                <code className="bg-base-300 px-3 py-2 rounded-lg font-mono text-lg flex-1 text-center">
                  {tempPassword}
                </code>
                <button 
                  className="btn btn-primary btn-sm btn-square"
                  onClick={() => copyToClipboard(tempPassword)}
                >
                  <RiFileCopyLine size={16} />
                </button>
              </div>
            </div>

            <div className="alert alert-warning text-xs mb-4">
              <RiInformationLine size={16} />
              <span>{t('passwordWarning')}</span>
            </div>

            <button className="btn btn-primary w-full" onClick={() => setPasswordModal(false)}>
              {t('done')}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                  <RiDeleteBinLine className="text-error" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('confirmDelete')}</h3>
              </div>
              <button className="btn btn-sm btn-circle" onClick={() => {setConfirmDeleteModal(false); setDeleteTarget(null);}}>
                <RiCloseLine size={18} />
              </button>
            </div>

            <p className="text-base-content/70 mb-4">
              {deleteTarget.type === 'company' 
                ? t('confirmDeleteCompanyMsg', { name: deleteTarget.name })
                : t('confirmDeleteUserMsg', { name: deleteTarget.name })
              }
            </p>

            <div className="alert alert-error/10 text-xs mb-4">
              <RiErrorWarningLine size={16} className="text-error" />
              <span className="text-error">{t('cannotUndo')}</span>
            </div>

            <div className="flex gap-3">
              <button className="btn flex-1" onClick={() => {setConfirmDeleteModal(false); setDeleteTarget(null);}}>
                {t('cancel')}
              </button>
              <button 
                className="btn btn-error flex-1" 
                onClick={deleteTarget.type === 'company' ? handleDeleteCompany : handleDeleteUser}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}