'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import {
  RiDashboardLine,
  RiScanLine,
  RiShieldLine,
  RiFileTextLine,
  RiSettings3Line,
  RiAdminLine,
  RiLogoutBoxLine,
  RiShieldCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
  RiRadarLine,
  RiVipCrownLine,
} from 'react-icons/ri';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LocaleSwitcher } from '../ui/LocaleSwitcher';
import { useDashboardStats, useScans, useBreaches, useReports } from '../../hooks/useApi';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  badge?: string;
  badgeColor?: string;
}

export function Sidebar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: stats } = useDashboardStats();
  const { data: scansData } = useScans(1, 1);
  const { data: breachesData } = useBreaches(1, 1);
  const { data: reportsData } = useReports();

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      href: `/${locale}/dashboard`,
      icon: <RiDashboardLine size={20} />,
      badge: 'Live',
      badgeColor: 'success'
    },
    {
      key: 'scans',
      href: `/${locale}/scans`,
      icon: <RiScanLine size={20} />,
      badge: scansData?.total?.toString() || '0',
      badgeColor: 'primary'
    },
    {
      key: 'breaches',
      href: `/${locale}/breaches`,
      icon: <RiShieldLine size={20} />,
      badge: breachesData?.total?.toString() || '0',
      badgeColor: 'error'
    },
    {
      key: 'reports',
      href: `/${locale}/reports`,
      icon: <RiFileTextLine size={20} />,
      badge: reportsData?.length?.toString() || '0',
      badgeColor: 'ghost'
    },
    {
      key: 'admin',
      href: `/${locale}/admin`,
      icon: <RiAdminLine size={20} />,
      adminOnly: true
    },
    {
      key: 'superAdmin',
      href: `/${locale}/super-admin`,
      icon: <RiVipCrownLine size={20} />,
      superAdminOnly: true
    },
    {
      key: 'settings',
      href: `/${locale}/settings`,
      icon: <RiSettings3Line size={20} />
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`relative h-screen transition-all duration-500 ease-in-out ${collapsed ? 'w-20 ' : 'w-72'
        }`}
    >
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float animation-delay-2000" />
      </div>

      {/* Main sidebar with glass effect */}
      <div className="relative h-full bg-linear-to-b from-base-200/90 via-base-200/95 to-base-300/90 backdrop-blur-xl border-r border-base-300/50 shadow-2xl flex flex-col overflow-hidden group/sidebar">

        {/* Decorative top gradient line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary via-secondary to-accent" />

        {/* Logo Section with enhanced styling */}
        <div className={`relative p-6 border-b border-base-300/30 transition-all duration-300 ${collapsed ? 'px-3' : 'px-6'
          }`}>
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent" />
          <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {/* Logo with animated gradient */}
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover/logo:opacity-75 transition-opacity duration-300" />
              <div className="relative w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3">
                <RiShieldCheckLine className="text-white" size={22} />
              </div>
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-base-200 animate-pulse" />
            </div>

            {!collapsed && (
              <div className="animate-slide-right">
                <p className="font-bold text-base-content text-sm leading-tight bg-linear-to-r from-primary to-secondary bg-clip-text">
                  CyberGuard
                </p>
                <p className="text-base-content/30 text-xs flex items-center gap-1 mt-1">
                  <RiRadarLine size={10} className="text-primary/50" />
                  Security Monitor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Info with enhanced styling */}
        {user && (
          <div className={`relative border-b border-base-300/30 transition-all duration-300 ${collapsed ? 'px-3 py-4' : 'px-4 py-4'
            }`}>
            <div className="absolute inset-0 bg-linear-to-r from-secondary/5 to-transparent" />
            <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              {/* Avatar with animated ring */}
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-300" />
                <div className="relative w-9 h-9 bg-linear-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-2 border-primary/30 transform transition-all duration-300 group-hover/avatar:scale-110">
                  <span className="text-sm font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {user.name[0]?.toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 animate-slide-right">
                  <p className="text-sm font-medium text-base-content truncate flex items-center gap-1">
                    {user.name}
                    {isAdmin && (
                      <span className="badge badge-xs badge-primary/20 text-primary border-primary/30">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-base-content/40 truncate flex items-center gap-1">
                    <RiInformationLine size={10} />
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation with enhanced items */}
        <nav className="flex-1 p-3 space-y-1  scrollbar-thin scrollbar-thumb-base-300/50 scrollbar-track-transparent">
          {visibleItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);
            const isHovered = hoveredItem === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative group/item block transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredItem(item.key)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Active/Background indicator */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-linear-to-r from-primary/20 via-primary/10 to-transparent'
                    : 'hover:bg-base-300/30'
                  }`} />

                {/* Left accent line for active item */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-primary to-secondary rounded-full animate-pulse" />
                )}

                <div className={`relative flex items-center py-2.5 transition-all duration-300 ${collapsed ? 'justify-center' : 'gap-3'
                  }`}>
                  {/* Icon with glow effect */}
                  <div className={`relative transition-all duration-300 ${isActive
                      ? 'text-primary scale-110'
                      : 'text-base-content/40 group-hover/item:text-base-content/70 group-hover/item:scale-105'
                    }`}>
                    {item.icon}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
                    )}
                  </div>

                  {!collapsed && (
                    <>
                      <span className={`flex-1 text-sm font-medium transition-all duration-300 ${isActive
                          ? 'text-primary'
                          : 'text-base-content/60 group-hover/item:text-base-content'
                        }`}>
                        {t(item.key as any)}
                      </span>

                      {/* Badge if exists */}
                      {item.badge && (
                        <span className={`badge badge-sm badge-${item.badgeColor || 'ghost'} ${isActive ? 'badge-primary' : ''
                          } animate-slide-left`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-base-300/90 backdrop-blur-sm text-xs rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-50 border border-base-300/50">
                      {t(item.key as any)}
                      {item.badge && (
                        <span className={`ml-2 badge badge-xs badge-${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-base-300/90 backdrop-blur-sm rotate-45 border-l border-b border-base-300/50" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Controls with enhanced styling */}
        <div className={`relative border-t border-base-300/30 transition-all duration-300 ${collapsed ? 'p-3' : 'p-4'
          }`}>
          <div className="absolute inset-0 bg-linear-to-t from-base-300/20 to-transparent" />

          <div className={`relative space-y-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            {/* Theme and Locale */}
            <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between'}`}>
              <ThemeToggle />
              <LocaleSwitcher />
            </div>

            {/* Logout Button with enhanced styling */}
            <button
              onClick={logout}
              className={`group/btn relative w-full transition-all duration-300 ${collapsed ? 'px-0' : 'px-3'
                }`}
            >
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${collapsed ? 'hover:bg-error/10' : 'hover:bg-error/5'
                }`} />

              <div className={`relative flex items-center py-2.5 transition-all duration-300 ${collapsed ? 'justify-center' : 'gap-3'
                }`}>
                {/* Icon with hover effect */}
                <div className="text-error/50 group-hover/btn:text-error group-hover/btn:scale-110 transition-all duration-300">
                  <RiLogoutBoxLine size={18} />
                </div>

                {!collapsed && (
                  <span className="flex-1 text-sm text-error/70 group-hover/btn:text-error font-medium text-left transition-colors duration-300">
                    {t('logout')}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-error/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all duration-300 whitespace-nowrap z-50">
                    {t('logout')}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-error/90 rotate-45" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className=" absolute -right-2 top-20 w-6 h-6 bg-base-100/90 backdrop-blur-sm cursor-pointer border border-base-300/50 rounded-full flex items-center justify-center text-base-content/50 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:scale-110 group/btn z-10"
        >
          {collapsed ? (
            <RiArrowRightSLine size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          ) : (
            <RiArrowLeftSLine size={14} className="group-hover/btn:-translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(10px, -10px) scale(1.1); }
        }
        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-slide-right {
          animation: slide-right 0.3s ease-out;
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: oklch(var(--b3)/0.5);
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: oklch(var(--b3)/0.8);
        }
      `}</style>
    </aside>
  );
}