'use client';

import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';

export function Platforms() {
  const t = useTranslations('landing');

  return (
    <section className="py-12 px-6 border-y border-black/[0.06] bg-white/50">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <p className="text-center text-xs text-[#71717A] mb-6 tracking-wide uppercase">
            {t('platforms_label')}
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
            {/* Facebook */}
            <div className="flex items-center gap-2 text-[#6B7280]/60 hover:text-[#6B7280] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">Facebook</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 text-[#6B7280]/60 hover:text-[#6B7280] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5.838a4.162 4.162 0 100 8.324 4.162 4.162 0 000-8.324zm0 6.872a2.71 2.71 0 110-5.42 2.71 2.71 0 010 5.42zm5.338-7.043a.975.975 0 11-1.95 0 .975.975 0 011.95 0z" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">Instagram</span>
            </div>

            {/* Meta Ads */}
            <div className="flex items-center gap-2 text-[#6B7280]/60 hover:text-[#6B7280] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.782 4.032a.5.5 0 00-.478-.05l-8.304 3.27-8.304-3.27a.5.5 0 00-.696.46v14.866a.5.5 0 00.322.467l8.5 3.27a.5.5 0 00.356 0l8.5-3.27a.5.5 0 00.322-.467V4.432a.5.5 0 00-.218-.4zM12.5 20.554l-7.5-2.884V5.372l7.5 2.955v12.227zm1 0V8.327l7.5-2.955v12.298l-7.5 2.884z" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">Meta Ads</span>
            </div>

            {/* Messenger */}
            <div className="flex items-center gap-2 text-[#6B7280]/60 hover:text-[#6B7280] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2.16.15.25.36.27.58l.05 1.81c.02.57.6.94 1.12.71l2.02-.89c.17-.08.37-.1.55-.06.93.26 1.92.4 2.84.4 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.56l-2.89 4.58c-.46.73-1.44.91-2.12.39l-2.3-1.72a.6.6 0 00-.72 0l-3.1 2.35c-.41.31-.95-.18-.68-.62l2.89-4.58c.46-.73 1.44-.91 2.12-.39l2.3 1.72a.6.6 0 00.72 0l3.1-2.35c.41-.31.95.18.68.62z" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">Messenger</span>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-2 text-[#6B7280]/60 hover:text-[#6B7280] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">WhatsApp</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
