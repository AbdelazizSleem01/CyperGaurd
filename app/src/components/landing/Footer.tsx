'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { RiGithubLine, RiTwitterLine, RiLinkedinLine } from 'react-icons/ri';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const tNav = useTranslations('landing.nav');

  const FOOTER_LINKS = {
    product: [
      { href: '/features', label: tNav('features') },
      { href: '/pricing', label: tNav('pricing') },
      { href: '/security', label: t('security') },
    ],
    company: [
      { href: '/about', label: tNav('about') },
      { href: '/careers', label: t('careers') },
      { href: '/contact', label: tNav('contact') },
    ],
    legal: [
      { href: '/privacy', label: t('privacy') },
      { href: '/terms', label: t('terms') },
      { href: '/contact', label: tNav('contact') },
    ],
  };

  return (
    <footer className="bg-base-200/50 border-t border-base-300/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="CyberGuard"
                width={40}
                height={40}
                unoptimized
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                CyberGuard
              </span>
            </Link>
            <p className="text-sm text-base-content/60 mt-4 max-w-xs">
              {t('description')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-base-content/40 hover:text-primary transition-colors duration-200">
                <RiGithubLine size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-base-content/40 hover:text-primary transition-colors duration-200">
                <RiTwitterLine size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-base-content/40 hover:text-primary transition-colors duration-200">
                <RiLinkedinLine size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-base-content/80 mb-4">{t('product')}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-base-content/60 hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-base-content/80 mb-4">{t('company')}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-base-content/60 hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-base-content/80 mb-4">{t('legal')}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-base-content/60 hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-base-300/30 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-base-content/50">
            © {new Date().getFullYear()} CyberGuard. {t('allRights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-base-content/50 hover:text-primary transition-colors duration-200">
              {t('privacy')}
            </Link>
            <span className="text-base-content/30">•</span>
            <Link href="/terms" className="text-xs text-base-content/50 hover:text-primary transition-colors duration-200">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}