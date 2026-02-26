'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiUserAddLine,
  RiScanLine,
  RiAdminLine,
  RiUserLine,
  RiMailLine,
  RiShieldLine,
  RiTimeLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiRadarLine,
  RiDeleteBinLine,
  RiEditLine,
  RiLockLine,
  RiUserSettingsLine,
  RiDashboardLine,
  RiSettings4Line,
  RiHistoryLine,
  RiArrowRightLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiKeyLine,
  RiFileCopyLine,
} from 'react-icons/ri';
import { post, get, put, del } from '../../../../utils/apiClient';
import useSWR from 'swr';
import { formatDate } from '@shared/utils';
import { DashboardStats, ScanResult } from '@shared/types';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [adding, setAdding] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  // Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');

  // Delete confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Fetch users
  const { data: users, mutate: mutateUsers } = useSWR<User[]>('/admin/users', (url) => get<User[]>(url));

  // Fetch dashboard stats for real data
  const { data: stats } = useSWR<DashboardStats>('/dashboard/stats', (url) => get<DashboardStats>(url));

  // Fetch latest scans for active scans count
  const { data: scansData, mutate: mutateScans } = useSWR<ScanResult[]>('/scans', (url) => get<ScanResult[]>(url));

  // Normalize scans to array
  const scans = Array.isArray(scansData) ? scansData : [];

  // Calculate active scans
  const activeScans = scans.filter(s => s.status === 'running').length;

  // Get last scan time
  const lastScan = scans.find(s => s.status === 'completed' || s.status === 'failed');
  const lastScanTime = lastScan?.completedAt || lastScan?.startedAt;

  // Delete scan state
  const [deletingScanId, setDeletingScanId] = useState<string | null>(null);

  // Delete scan function
  const deleteScan = async (scanId: string) => {
    if (!confirm(t('confirmDeleteScan'))) return;

    try {
      setDeletingScanId(scanId);
      await del(`/scans/${scanId}`);
      toast.success(t('scanDeleted'));
      mutateScans();
    } catch (err: any) {
      toast.error(err.message || t('scanDeleted'));
    } finally {
      setDeletingScanId(null);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdding(true);
      const response = await post<{ user: User; tempPassword: string }>('/admin/users', newUser);

      if (response?.tempPassword) {
        setCreatedEmail(newUser.email);
        setCreatedPassword(response.tempPassword);
        setPasswordModalOpen(true);
      }

      toast.success(t('userCreated'));
      setNewUser({ name: '', email: '', role: 'user' });
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || t('userCreated'));
    } finally {
      setAdding(false);
    }
  };

  const triggerAllScans = async () => {
    try {
      setTriggering(true);
      await post('/scans/trigger', {
        types: ['port-scan', 'ssl-check', 'subdomain-enum', 'breach-check', 'directory-scan', 'risk-calc'],
      });
      toast.success(t('scanTriggered'));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTriggering(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      await put(`/admin/users/${editingUser._id}`, editForm);
      toast.success(t('editModal.saved'));
      setEditModalOpen(false);
      setEditingUser(null);
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || t('editModal.saved'));
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(t('confirmDeleteUser'))) return;

    try {
      setDeletingUserId(userId);
      await del(`/admin/users/${userId}`);
      toast.success(t('userDeleted'));
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || t('userDeleted'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(createdPassword);
    toast.success(t('passwordModal.copied'));
  };

  const filteredUsers = users?.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'badge-primary';
      case 'user': return 'badge-info';
      default: return '';
    }
  };

  // Format time ago
  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (locale === 'ar') {
      if (diffDays > 0) return `منذ ${diffDays} يوم`;
      if (diffHours > 0) return `منذ ${diffHours} ساعة`;
      if (diffMins > 0) return `منذ ${diffMins} دقيقة`;
      return 'الآن';
    }

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Get risk category color
  const getRiskColor = (category?: string) => {
    switch (category) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-info';
      case 'High': return 'text-warning';
      case 'Critical': return 'text-error';
      default: return 'text-warning';
    }
  };

  // Scan type labels
  const scanTypeLabels = locale === 'ar'
    ? { 'Port Scan': 'فحص المنافذ', 'SSL Check': 'فحص SSL', 'Subdomains': 'النطاقات الفرعية', 'Breach Check': 'فحص الاختراقات', 'Directory Scan': 'فحص المجلدات', 'Risk Calc': 'حساب المخاطر' }
    : { 'Port Scan': 'Port Scan', 'SSL Check': 'SSL Check', 'Subdomains': 'Subdomains', 'Breach Check': 'Breach Check', 'Directory Scan': 'Directory Scan', 'Risk Calc': 'Risk Calc' };

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

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="relative mb-8">
          <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
          <div className="pl-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <RiAdminLine className="text-white" size={22} />
                </div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('title')}
                </h1>
              </div>
              <p className="text-sm text-base-content/50 flex items-center gap-2 ml-1">
                <RiShieldLine size={14} className="text-primary/50" />
                {t('subtitle')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50">
                <p className="text-xs text-base-content/40">{t('totalUsers')}</p>
                <p className="text-xl font-bold text-center text-primary">{users?.length || 0}</p>
              </div>
              <div className="px-4 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50">
                <p className="text-xs text-base-content/40">{t('admins')}</p>
                <p className="text-xl font-bold text-center text-secondary">{users?.filter((u) => u.role === 'admin').length || 0}</p>
              </div>
              <div className="px-4 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50">
                <p className="text-xs text-base-content/40">{t('totalScans')}</p>
                <p className="text-xl font-bold text-center text-accent">{stats?.totalScans || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add User Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-primary/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary to-secondary" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary to-secondary" />

            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <RiUserAddLine className="text-white" size={20} />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-base-content">{t('addTeamMember')}</h2>
                  <p className="text-xs text-base-content/40">{t('addTeamMemberDesc')}</p>
                </div>
              </div>

              <form onSubmit={addUser} className="space-y-4">
                <div className="relative">
                  <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200/30 pl-9 focus:pl-10 transition-all duration-300"
                    placeholder={t('fullName')}
                    value={newUser.name}
                    onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                  <input
                    type="email"
                    className="input input-bordered w-full bg-base-200/30 pl-9 focus:pl-10 transition-all duration-300"
                    placeholder={t('emailAddress')}
                    value={newUser.email}
                    onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="relative">
                  <RiUserSettingsLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                  <select
                    className="select select-bordered w-full bg-base-200/30 pl-9 transition-all duration-300 appearance-none"
                    value={newUser.role}
                    onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
                  >
                    <option value="user">{t('userRole')}</option>
                    <option value="admin">{t('adminRole')}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      {t('creatingUser')}
                    </>
                  ) : (
                    <>
                      <RiUserAddLine size={16} />
                      {t('createUser')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Manual Scan Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-secondary/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-secondary to-accent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-secondary to-accent" />

            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-secondary to-accent rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 bg-linear-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                    <RiScanLine className="text-white" size={20} />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-base-content">{t('manualOperations')}</h2>
                  <p className="text-xs text-base-content/40">{t('manualOperationsDesc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-linear-to-br from-info/5 to-info/10 rounded-xl border border-info/20">
                  <div className="flex items-start gap-3">
                    <RiRadarLine className="text-info shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-base-content mb-1">{t('fullSecurityScan')}</p>
                      <p className="text-xs text-base-content/40">
                        {t('fullScanDesc')}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Port Scan', 'SSL Check', 'Subdomains', 'Breach Check', 'Directory Scan', 'Risk Calc'].map((item) => (
                          <span key={item} className="badge badge-sm bg-base-200/50">
                            {scanTypeLabels[item as keyof typeof scanTypeLabels]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary w-full bg-linear-to-r from-secondary to-accent border-0 hover:from-secondary-focus hover:to-accent-focus gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/25"
                  onClick={triggerAllScans}
                  disabled={triggering}
                >
                  {triggering ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      {t('scanningInProgress')}
                    </>
                  ) : (
                    <>
                      <RiScanLine size={18} />
                      {t('runFullScan')}
                    </>
                  )}
                </button>

                {/* Last Scan Info */}
                <div className="flex items-center justify-between text-xs text-base-content/30">
                  <span className="flex items-center gap-1">
                    <RiHistoryLine size={12} />
                    {t('lastScan')}: {lastScanTime ? getTimeAgo(lastScanTime) : t('noScansYet')}
                  </span>
                  <span className="flex items-center gap-1">
                    <RiCheckboxCircleLine size={12} className="text-success" />
                    {t('systemOperational')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Users List Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl lg:col-span-2">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <RiUserLine className="text-primary" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">{t('teamMembers')}</h2>
                    <p className="text-xs text-base-content/40">{t('teamMembersDesc')}</p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                    <input
                      type="text"
                      placeholder={t('searchUsers')}
                      className="input input-sm input-bordered bg-base-200/30 pl-8 w-48 focus:w-64 transition-all duration-300"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-sm gap-2 border border-base-300/50"
                    >
                      <RiFilterLine size={14} />
                      {t('role')}
                    </button>
                    <div
                      tabIndex={0}
                      className="dropdown-content mt-2 z-50 w-40 bg-base-100/90 backdrop-blur-sm rounded-xl shadow-xl border border-base-300/50 p-2"
                    >
                      {['all', 'user', 'admin'].map((role) => (
                        <button
                          key={role}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all duration-200 ${filterRole === role
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-base-200/50'
                            }`}
                          onClick={() => setFilterRole(role)}
                        >
                          {role === 'all' ? (locale === 'ar' ? 'الكل' : 'All') : t(role)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => mutateUsers()}
                    className="btn btn-sm btn-square border border-base-300/50"
                  >
                    <RiRefreshLine size={14} />
                  </button>
                </div>
              </div>

              {filteredUsers?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('role')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('joined')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('status')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-300/30">
                      {filteredUsers.map((u, index) => (
                        <tr
                          key={u._id}
                          className="group/row hover:bg-base-200/30 transition-all duration-200 animate-slide-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className={`w-8 h-8 rounded-full bg-linear-to-br ${u.role === 'admin'
                                  ? 'from-primary to-secondary'
                                  : 'from-base-300 to-base-200'
                                  } flex items-center justify-center`}>
                                  <span className="text-xs font-bold text-white">
                                    {u.name[0]?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <span className="font-medium text-sm text-base-content/80 group-hover/row:text-base-content transition-colors">
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-base-content/60">{u.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge badge-sm ${getRoleBadgeColor(u.role)}`}>
                              {t(u.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-base-content/40">
                              <RiTimeLine size={12} />
                              {formatDate(u.createdAt, locale as 'en' | 'ar')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute h-2 w-2 rounded-full bg-success opacity-75" />
                                <span className="relative rounded-full h-2 w-2 bg-success" />
                              </span>
                              <span className="text-xs text-success/80">{t('active')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                className="btn btn-xs btn-square text-base-content/30 hover:text-primary transition-all duration-200 hover:scale-110"
                                onClick={() => openEditModal(u)}
                              >
                                <RiEditLine size={14} />
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  className={`btn btn-xs btn-square transition-all duration-200 hover:scale-110 ${deletingUserId === u._id
                                    ? 'text-error loading loading-spinner loading-xs'
                                    : 'text-base-content/30 hover:text-error'
                                    }`}
                                  onClick={() => deleteUser(u._id)}
                                  disabled={deletingUserId === u._id}
                                >
                                  {deletingUserId !== u._id && <RiDeleteBinLine size={14} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-base-200/50 flex items-center justify-center mx-auto mb-3">
                    <RiUserLine className="text-base-content/30" size={24} />
                  </div>
                  <p className="text-base-content/50 text-sm">{t('noTeamMembers')}</p>
                  <p className="text-xs text-base-content/30 mt-1">{t('addFirstMember')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats ? 'bg-success/10' : 'bg-warning/10'}`}>
                {stats ? (
                  <RiCheckboxCircleLine className="text-success" size={16} />
                ) : (
                  <span className="loading loading-spinner loading-xs text-warning" />
                )}
              </div>
              <div>
                <p className="text-xs text-base-content/40">{t('systemStatus')}</p>
                <p className="text-sm font-semibold text-base-content">
                  {stats ? t('allSystemsOperational') : t('connecting')}
                </p>
                {stats?.lastScanAt && (
                  <p className="text-xs text-base-content/30 mt-0.5">
                    {t('lastSync')}: {getTimeAgo(stats.lastScanAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeScans > 0 ? 'bg-info/10' : 'bg-base-200/50'}`}>
                {activeScans > 0 ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute h-3 w-3 rounded-full bg-info opacity-75" />
                    <span className="relative rounded-full h-3 w-3 bg-info" />
                  </span>
                ) : (
                  <RiRadarLine className="text-base-content/30" size={16} />
                )}
              </div>
              <div>
                <p className="text-xs text-base-content/40">{t('activeScans')}</p>
                <p className="text-sm font-semibold text-base-content">
                  {activeScans > 0 ? `${activeScans} ${t('scanInProgress')}` : t('noActiveScans')}
                </p>
                {lastScanTime && (
                  <p className="text-xs text-base-content/30 mt-0.5">
                    {t('lastScan')}: {getTimeAgo(lastScanTime)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!stats ? 'bg-base-200/50' :
                stats.riskScore >= 75 ? 'bg-success/10' :
                  stats.riskScore >= 50 ? 'bg-info/10' :
                    stats.riskScore >= 25 ? 'bg-warning/10' : 'bg-error/10'
                }`}>
                {stats ? (
                  <RiLockLine className={
                    !stats ? 'text-base-content/30' :
                      stats.riskScore >= 75 ? 'text-success' :
                        stats.riskScore >= 50 ? 'text-info' :
                          stats.riskScore >= 25 ? 'text-warning' : 'text-error'
                  } size={16} />
                ) : (
                  <span className="loading loading-spinner loading-xs text-base-content/30" />
                )}
              </div>
              <div>
                <p className="text-xs text-base-content/40">{t('securityScore')}</p>
                <p className={`text-sm font-semibold ${getRiskColor(stats?.riskCategory)}`}>
                  {stats ? `${stats.riskScore}/100` : '--/100'}
                  <span className="text-xs font-normal text-base-content/40 ml-1">
                    ({stats?.riskCategory || 'N/A'})
                  </span>
                </p>
                {stats?.riskScore !== undefined && (
                  <div className="w-full h-1 bg-base-300/50 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stats.riskScore >= 75 ? 'bg-success' :
                        stats.riskScore >= 50 ? 'bg-info' :
                          stats.riskScore >= 25 ? 'bg-warning' : 'bg-error'
                        }`}
                      style={{ width: `${stats.riskScore}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4 text-center">
            <RiShieldLine className="text-warning mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-warning">{stats?.openPorts || 0}</p>
            <p className="text-xs text-base-content/40">{t('openPorts')}</p>
          </div>
          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4 text-center">
            <RiMailLine className="text-error mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-error">{stats?.exposedCredentials || 0}</p>
            <p className="text-xs text-base-content/40">{t('exposedCredentials')}</p>
          </div>
          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4 text-center">
            <RiLockLine className="text-info mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-info">{stats?.expiredSslCerts || 0}</p>
            <p className="text-xs text-base-content/40">{t('expiredSslCerts')}</p>
          </div>
          <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 p-4 text-center">
            <RiRadarLine className="text-primary mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-primary">{stats?.totalScans || 0}</p>
            <p className="text-xs text-base-content/40">{t('totalScans')}</p>
          </div>
        </div>

        {/* Scan History Section */}
        {scans.length > 0 && (
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl mt-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <RiHistoryLine className="text-primary" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">{t('scanHistory')}</h2>
                    <p className="text-xs text-base-content/40">{t('scanHistoryDesc')}</p>
                  </div>
                </div>

                <button
                  onClick={() => mutateScans()}
                  className="btn btn-sm btn-square border border-base-300/50"
                >
                  <RiRefreshLine size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('domain')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('ports')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('started')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300/30">
                    {scans.slice(0, 10).map((scan, index) => (
                      <tr
                        key={scan._id}
                        className="group/row hover:bg-base-200/30 transition-all duration-200 animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-base-content/80">{scan.domain}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge badge-sm ${scan.status === 'completed' ? 'badge-success' :
                            scan.status === 'running' ? 'badge-info' :
                              scan.status === 'failed' ? 'badge-error' : 'badge-warning'
                            }`}>
                            {scan.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-base-content/60">{scan.ports?.length || 0} {locale === 'ar' ? 'مفتوح' : 'open'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-base-content/40">
                            {scan.startedAt ? getTimeAgo(scan.startedAt) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteScan(scan._id)}
                            disabled={deletingScanId === scan._id}
                            className={`btn btn-xs btn-square transition-all duration-200 hover:scale-110 ${deletingScanId === scan._id
                              ? 'text-error loading loading-spinner loading-xs'
                              : 'text-base-content/30 hover:text-error hover:bg-error/10'
                              }`}
                          >
                            {deletingScanId !== scan._id && <RiDeleteBinLine size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {scans.length > 10 && (
                <div className="px-4 py-3 border-t border-base-300/50 text-center">
                  <p className="text-xs text-base-content/40">
                    {t('showing')} 10 {t('of')} {scans.length} {t('scans')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('adminAccessOnly')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiRadarLine size={14} className="text-secondary/50" />
            {t('auditLogEnabled')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiTimeLine size={14} className="text-accent/50" />
            {t('realtimeMonitoring')}
          </span>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <RiKeyLine className="text-success" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('passwordModal.title')}</h3>
              </div>
              <button
                className="btn btn-sm btn-circle"
                onClick={() => setPasswordModalOpen(false)}
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="bg-base-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-base-content/50 mb-1">{t('passwordModal.email')}</p>
              <p className="font-mono text-sm mb-3">{createdEmail}</p>

              <p className="text-xs text-base-content/50 mb-1">{t('passwordModal.tempPassword')}</p>
              <div className="flex items-center gap-2">
                <code className="bg-base-300 px-3 py-2 rounded-lg font-mono text-lg flex-1 text-center">
                  {createdPassword}
                </code>
                <button
                  className="btn btn-primary btn-sm btn-square"
                  onClick={copyPassword}
                >
                  <RiFileCopyLine size={16} />
                </button>
              </div>
            </div>

            <div className="alert alert-warning text-xs mb-4">
              <RiInformationLine size={16} />
              <span>{t('passwordModal.warning')}</span>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => setPasswordModalOpen(false)}
            >
              {t('passwordModal.done')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <RiEditLine className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-semibold">{t('editModal.title')}</h3>
              </div>
              <button
                className="btn btn-sm btn-circle"
                onClick={() => setEditModalOpen(false)}
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('editModal.name')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={editForm.name}
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('editModal.email')}</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered input-sm"
                  value={editForm.email}
                  onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-semibold">{t('editModal.role')}</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={editForm.role}
                  onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value as 'admin' | 'user' }))}
                >
                  <option value="user">{t('user')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="btn flex-1"
                onClick={() => setEditModalOpen(false)}
              >
                {t('editModal.cancel')}
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  t('editModal.save')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
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
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
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