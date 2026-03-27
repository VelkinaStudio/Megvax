'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const columns = [
  {
    titleKey: null,
    title: 'Product',
    links: [
      { href: '/about', key: 'footer_about' },
      { href: '/pricing', key: 'footer_pricing' },
      { href: '/#features', key: 'footer_product' },
    ],
  },
  {
    titleKey: null,
    title: 'Support',
    links: [
      { href: '/contact', key: 'footer_contact' },
      { href: '/status', key: 'footer_status' },
    ],
  },
  {
    titleKey: null,
    title: 'Legal',
    links: [
      { href: '/privacy', key: 'footer_privacy' },
      { href: '/terms', key: 'footer_terms' },
      { href: '/cookies', key: 'footer_cookies' },
    ],
  },
] as const;

// ─── Floating particle field ─────────────────────────────────────────────────

function FooterParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 11.3) % 84)}%`,
        top: `${12 + ((i * 17.7) % 76)}%`,
        size: 2 + (i % 3),
        duration: 12 + (i % 5) * 3,
        delay: i * 1.1,
        driftX: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 4),
        driftY: -(6 + (i % 3) * 5),
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: 0.04,
            willChange: 'transform, opacity',
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated footer link ────────────────────────────────────────────────────

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative text-[14px] text-landing-text-muted hover:text-landing-text transition-colors w-fit"
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-[#2563EB]/40 transition-all duration-200 ease-out group-hover:w-full" />
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="relative pt-px">
      {/* Animated gradient border at top */}
      <div
        className="absolute top-0 inset-x-0 h-px animate-[gradient-shift_8s_ease_infinite]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, #2563EB 25%, #7C3AED 50%, #2563EB 75%, transparent 100%)',
          backgroundSize: '200% 100%',
          opacity: 0.5,
        }}
      />

      {/* Ambient particle field */}
      <FooterParticles />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Product */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              {t('footer_product')}
            </span>
            {columns[0].links.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(link.key)}
              </FooterLink>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              {t('footer_support')}
            </span>
            {columns[1].links.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(link.key)}
              </FooterLink>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              {t('footer_legal')}
            </span>
            {columns[2].links.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(link.key)}
              </FooterLink>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-landing-text mb-1">
              {t('footer_contact_title')}
            </span>
            <a
              href="mailto:destek@megvax.com"
              className="group relative text-[14px] text-landing-text-muted hover:text-[#2563EB] transition-colors w-fit"
            >
              destek@megvax.com
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-[#2563EB]/40 transition-all duration-200 ease-out group-hover:w-full" />
            </a>
            <span className="text-[14px] text-landing-text-muted">
              {t('footer_location')}
            </span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="h-px bg-gradient-to-r from-transparent via-landing-card-border to-transparent mt-12 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo with breathing glow */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 4px 0px rgba(37, 99, 235, 0.3)',
                  '0 0 12px 3px rgba(37, 99, 235, 0.5)',
                  '0 0 4px 0px rgba(37, 99, 235, 0.3)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ willChange: 'box-shadow' }}
            >
              <span
                className="text-white font-bold text-xs"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                M
              </span>
            </motion.div>
            <span
              className="text-sm font-medium text-landing-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MegVax
            </span>
          </div>

          {/* Status indicator with pulsing green dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[13px] text-[#71717A]">
              {t('footer_copyright')}
            </span>
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
