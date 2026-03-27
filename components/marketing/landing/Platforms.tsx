'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';
import { useState } from 'react';

// ─── Platform logo SVG components (muted, monochrome) ────────────────────────

function FacebookLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5.838a4.162 4.162 0 100 8.324 4.162 4.162 0 000-8.324zm0 6.872a2.71 2.71 0 110-5.42 2.71 2.71 0 010 5.42zm5.338-7.043a.975.975 0 11-1.95 0 .975.975 0 011.95 0z" />
    </svg>
  );
}

function GoogleAdsLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.006 15.885l5.478-9.488a3.62 3.62 0 016.268 3.62l-5.478 9.488a3.62 3.62 0 01-6.268-3.62zm14.322-4.074a3.62 3.62 0 11-3.14-1.813l5.478-9.488a3.62 3.62 0 016.268 3.62L20.456 15.43a3.62 3.62 0 01-3.128-3.619z" />
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43V7.56a8.16 8.16 0 004.77 1.52v-3.4c-.36.04-.73.04-1.19.01z" />
    </svg>
  );
}

function YouTubeLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function MessengerLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2.16.15.25.36.27.58l.05 1.81c.02.57.6.94 1.12.71l2.02-.89c.17-.08.37-.1.55-.06.93.26 1.92.4 2.84.4 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.56l-2.89 4.58c-.46.73-1.44.91-2.12.39l-2.3-1.72a.6.6 0 00-.72 0l-3.1 2.35c-.41.31-.95-.18-.68-.62l2.89-4.58c.46-.73 1.44-.91 2.12-.39l2.3 1.72a.6.6 0 00.72 0l3.1-2.35c.41-.31.95.18.68.62z" />
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Logo items for the marquee ──────────────────────────────────────────────

// Brand colors for hover effect
const brandColors: Record<string, string> = {
  Facebook: '#1877F2',
  Instagram: '#E4405F',
  'Google Ads': '#4285F4',
  TikTok: '#000000',
  YouTube: '#FF0000',
  Messenger: '#0084FF',
  WhatsApp: '#25D366',
};

const logos = [
  { name: 'Facebook', Icon: FacebookLogo },
  { name: 'Instagram', Icon: InstagramLogo },
  { name: 'Google Ads', Icon: GoogleAdsLogo },
  { name: 'TikTok', Icon: TikTokLogo },
  { name: 'YouTube', Icon: YouTubeLogo },
  { name: 'Messenger', Icon: MessengerLogo },
  { name: 'WhatsApp', Icon: WhatsAppLogo },
];

// ─── Single Logo Item with hover brand color ─────────────────────────────────

function LogoItem({ name, Icon }: { name: string; Icon: () => React.JSX.Element }) {
  const [isHovered, setIsHovered] = useState(false);
  const brandColor = brandColors[name] || '#6B7280';

  return (
    <motion.div
      className="flex items-center gap-3 shrink-0 transition-colors duration-300"
      style={{
        color: isHovered ? brandColor : '#9CA3AF',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Icon />
      <span
        className="text-sm font-medium whitespace-nowrap"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {name}
      </span>
    </motion.div>
  );
}

// ─── Marquee Row with center proximity scale ─────────────────────────────────

function MarqueeRow({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  const items = [...logos, ...logos]; // duplicate for seamless loop
  const xFrom = direction === 'left' ? '0%' : '-50%';
  const xTo = direction === 'left' ? '-50%' : '0%';

  return (
    <motion.div
      className="flex gap-12 items-center"
      animate={{ x: [xFrom, xTo] }}
      transition={{
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 30,
          ease: 'linear',
        },
      }}
    >
      {items.map((logo, i) => (
        <LogoItem key={`${logo.name}-${i}`} name={logo.name} Icon={logo.Icon} />
      ))}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Platforms() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 sm:py-20 overflow-hidden border-y border-black/[0.04] bg-white/40">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <p
              className="text-sm sm:text-base font-semibold text-landing-text mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('platforms_trusted_by', { count: '150' })}
            </p>
            <p className="text-xs text-landing-text-muted">
              {t('platforms_trusted_subtitle')}
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Marquee with gradient fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-6">
          <MarqueeRow direction="left" />
        </div>
      </div>
    </section>
  );
}
