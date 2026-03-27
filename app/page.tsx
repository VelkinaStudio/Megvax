import { Nav } from '@/components/marketing/landing/Nav';
import { Hero } from '@/components/marketing/landing/Hero';
import { DashboardPreview } from '@/components/marketing/landing/DashboardPreview';
import { Platforms } from '@/components/marketing/landing/Platforms';
import { BeforeAfter } from '@/components/marketing/landing/BeforeAfter';
import { HowItWorks } from '@/components/marketing/landing/HowItWorks';
import { WhatItDoes } from '@/components/marketing/landing/WhatItDoes';
import { MetricsStrip } from '@/components/marketing/landing/MetricsStrip';
import { Testimonials } from '@/components/marketing/landing/Testimonials';
import { FinalCTA } from '@/components/marketing/landing/FinalCTA';
import { Footer } from '@/components/marketing/landing/Footer';

export default function Home() {
  return (
    <main className="bg-[#FAFAF8] text-[#1A1A1A] min-h-screen">
      <Nav />
      <Hero />
      <DashboardPreview />
      <Platforms />
      <BeforeAfter />
      <HowItWorks />
      <WhatItDoes />
      <MetricsStrip />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
