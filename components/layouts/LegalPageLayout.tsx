'use client';

import { useState, useEffect, useRef } from 'react';
import { Nav } from '@/components/marketing/landing/Nav';
import { Footer } from '@/components/marketing/landing/Footer';
import { useTranslations } from '@/lib/i18n';
import Link from 'next/link';

interface Section {
  id: string;
  number: string;
  title: string;
  content: string | string[];
}

interface LegalPageLayoutProps {
  pageTitle: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: Section[];
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LegalPageLayout({ pageTitle, effectiveDate, lastUpdated, sections }: LegalPageLayoutProps) {
  const t = useTranslations('legal');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [tocOpen, setTocOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  // Close mobile TOC on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) {
        setTocOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTocOpen(false);
    }
  }

  function renderContent(content: string | string[]) {
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-outside pl-5 space-y-2">
          {content.map((item, i) => (
            <li key={i} className="text-[#4B5563] leading-relaxed text-base md:text-lg">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    // Split paragraphs on double newline
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, i) => (
      <p key={i} className="text-[#4B5563] leading-relaxed text-base md:text-lg">
        {para}
      </p>
    ));
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      {/* Hero */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pt-36 md:pb-16">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {pageTitle}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#9CA3AF]">
            <span>{t('effective_date')}: {effectiveDate}</span>
            <span>{t('last_updated')}: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Mobile TOC dropdown */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#FAFAF8] border-b border-[#E5E7EB]" ref={tocRef}>
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-[#374151]"
        >
          <span>{t('table_of_contents')}</span>
          <ChevronDown className={`transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`} />
        </button>
        {tocOpen && (
          <nav className="px-6 pb-4 space-y-1 max-h-64 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left text-sm py-1.5 transition-colors ${
                  activeSection === section.id
                    ? 'text-[#2563EB] font-medium'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {section.number}. {section.title}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Content area with sidebar */}
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        {/* Desktop sidebar TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-4">
              {t('table_of_contents')}
            </p>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-[13px] py-1.5 px-3 rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'text-[#2563EB] bg-[#EFF6FF] font-medium'
                        : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {section.number}. {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <article className="min-w-0">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={`scroll-mt-24 ${index > 0 ? 'mt-10 pt-10 border-t border-[#E5E7EB]' : ''}`}
            >
              <h2
                className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {section.number}. {section.title}
              </h2>
              <div className="space-y-4">
                {renderContent(section.content)}
              </div>
            </section>
          ))}

          {/* Contact CTA */}
          <div className="mt-16 pt-10 border-t border-[#E5E7EB]">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                {t('questions_heading')}
              </h3>
              <p className="text-[#6B7280] text-sm md:text-base mb-4">
                {t('questions_description')}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                {t('questions_cta')}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  );
}
