'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  RiMenuLine,
  RiCloseLine,
  RiSunLine,
  RiMoonLine,
  RiGlobalLine,
  RiArrowDownSLine,
  RiShieldLine,
  RiFlashlightLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiSettings4Line,
  RiNotification4Line
} from 'react-icons/ri';
import { useTheme } from '../providers/ThemeProvider';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function Navbar() {
  const t = useTranslations('landing.nav');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const NAV_LINKS = [
    {
      href: '/features',
      label: t('features'),
      icon: RiFlashlightLine,
      dropdown: [
        { href: '/features/scanning', label: t('portScanning') },
        { href: '/features/ssl', label: t('sslMonitoring') },
        { href: '/features/breach', label: t('breachDetection') },
      ]
    },
    { href: '/pricing', label: t('pricing'), icon: RiShieldLine },
    { href: '/about', label: t('about'), icon: RiShieldLine },
    { href: '/contact', label: t('contact'), icon: RiShieldLine },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.lang-menu')) {
        setShowLangMenu(false);
      }
      if (!(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (!(event.target as Element).closest('.dropdown-menu')) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  const changeLanguage = (code: string) => {
    const currentPath = pathname.replace(/^\/(en|ar|fr|es)/, '');
    window.location.href = `/${code}${currentPath}`;
    setShowLangMenu(false);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-base-100/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-base-300/20'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with Animation */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute -inset-2 bg-linear-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/logo.png"
                alt="CyberGuard"
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />
            </div>
            <div className="relative overflow-hidden">
              <span className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
                CyberGuard
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 bg-base-200/30 p-1 rounded-2xl backdrop-blur-sm border border-base-300/30">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.href}
                  className="relative group/dropdown"
                  onMouseEnter={() => link.dropdown && setShowDropdown(link.href)}
                  onMouseLeave={() => link.dropdown && setShowDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 group ${pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-base-content/70 hover:text-primary hover:bg-base-300/30'
                      }`}
                  >
                    <link.icon
                      size={16}
                      className={`transition-transform duration-300 ${pathname === link.href ? 'text-primary' : 'group-hover:scale-110'
                        }`}
                    />
                    <span>{link.label}</span>
                    {link.dropdown && (
                      <RiArrowDownSLine
                        size={14}
                        className={`transition-transform duration-300 ${showDropdown === link.href ? 'rotate-180' : ''
                          }`}
                      />
                    )}
                  </Link>

                  {link.dropdown && showDropdown === link.href && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 w-48">
                      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300/50 backdrop-blur-xl overflow-hidden animate-slideDown">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2.5 text-sm text-base-content/70 hover:text-primary hover:bg-base-200/50 transition-all duration-200 border-b border-base-300/10 last:border-0"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative lang-menu">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`p-2 text-base-content/50 hover:text-primary transition-all duration-300 hover:scale-110 flex items-center gap-1 ${showLangMenu ? 'text-primary' : ''
                  }`}
              >
                <RiGlobalLine size={18} />
                <RiArrowDownSLine
                  size={14}
                  className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-base-100 rounded-xl shadow-xl border border-base-300/50 backdrop-blur-xl overflow-hidden animate-slideDown">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-base-200/50 transition-all duration-200 flex items-center gap-2 border-b border-base-300/10 last:border-0"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-base-content/50 hover:text-primary transition-all duration-300 hover:scale-110 relative group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>

            {/* User Menu / Auth Buttons */}
            {isLoggedIn ? (
              <div className="relative user-menu ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 border border-primary/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                    <RiUserLine className="text-white" size={16} />
                  </div>
                  <RiArrowDownSLine
                    size={16}
                    className={`text-primary transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-xl border border-base-300/50 backdrop-blur-xl overflow-hidden animate-slideDown">
                    <div className="p-3 border-b border-base-300/10">
                      <p className="text-sm font-medium">Ahmed Hassan</p>
                      <p className="text-xs text-base-content/50">ahmed@example.com</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content/70 hover:text-primary hover:bg-base-200/50 transition-all duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <RiShieldLine size={16} />
                      Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content/70 hover:text-primary hover:bg-base-200/50 transition-all duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <RiSettings4Line size={16} />
                      Settings
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content/70 hover:text-primary hover:bg-base-200/50 transition-all duration-200 border-b border-base-300/10"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <RiNotification4Line size={16} />
                      Notifications
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-all duration-200"
                    >
                      <RiLogoutBoxLine size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary transition-all duration-300 hover:scale-105"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="relative group px-5 py-2 bg-linear-to-r from-primary to-secondary rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10">{t('register')}</span>
                  <div className="absolute inset-0 bg-linear-to-r from-primary-focus to-secondary-focus opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-base-content/50 hover:text-primary transition-all duration-300 hover:scale-110"
            >
              {isDark ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-10 h-10 flex items-center justify-center text-base-content/50 hover:text-primary transition-all duration-300"
            >
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              {isOpen ? (
                <RiCloseLine size={24} className="animate-spin" />
              ) : (
                <RiMenuLine size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 bg-base-100/95 backdrop-blur-xl transition-all duration-500 overflow-hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="h-full overflow-y-auto px-4 py-6">
          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            {NAV_LINKS.map((link) => (
              <div key={link.href}>
                {link.dropdown ? (
                  <button
                    onClick={() => setMobileDropdown(mobileDropdown === link.href ? null : link.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'bg-linear-to-r from-primary/10 to-secondary/10 text-primary'
                      : 'text-base-content/70 hover:bg-base-200/50 hover:text-primary'
                      }`}
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.label}</span>
                    <RiArrowDownSLine
                      size={16}
                      className={`ml-auto transition-transform duration-300 ${mobileDropdown === link.href ? 'rotate-180' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === link.href
                      ? 'bg-linear-to-r from-primary/10 to-secondary/10 text-primary'
                      : 'text-base-content/70 hover:bg-base-200/50 hover:text-primary'
                      }`}
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )}

                {link.dropdown && mobileDropdown === link.href && (
                  <div className="ml-11 mt-2 space-y-2 animate-slideDown">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { setIsOpen(false); setMobileDropdown(null); }}
                        className={`block px-4 py-2 text-sm transition-colors rounded-lg ${pathname === item.href
                          ? 'text-primary bg-primary/5'
                          : 'text-base-content/60 hover:text-primary hover:bg-base-200/50'
                          }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Language Switcher Mobile */}
          <div className="mt-6 p-4 bg-base-200/30 rounded-xl border border-base-300/30">
            <p className="text-xs text-base-content/50 mb-3 flex items-center gap-2">
              <RiGlobalLine size={14} />
              Language
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="px-3 py-2 text-sm rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Auth Section */}
          <div className="mt-6 space-y-3">
            {isLoggedIn ? (
              <>
                <div className="p-4 bg-linear-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                      <RiUserLine className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Ahmed Hassan</p>
                      <p className="text-xs text-base-content/50">ahmed@example.com</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-error bg-error/10 rounded-xl hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
                >
                  <RiLogoutBoxLine size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-3 text-center text-sm font-medium bg-base-200/50 text-base-content/70 rounded-xl hover:bg-base-200 hover:text-primary transition-all duration-300"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-3 text-center text-sm font-medium bg-linear-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-xs text-base-content/30">
            <p>© 2024 CyberGuard. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}