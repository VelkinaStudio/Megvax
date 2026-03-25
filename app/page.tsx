import { Nav } from '@/components/marketing/landing/Nav';
import { Hero } from '@/components/marketing/landing/Hero';
import { SocialProof } from '@/components/marketing/landing/SocialProof';
import { WhatItDoes } from '@/components/marketing/landing/WhatItDoes';
import { HowItWorks } from '@/components/marketing/landing/HowItWorks';
import { MetricsStrip } from '@/components/marketing/landing/MetricsStrip';
import { FinalCTA } from '@/components/marketing/landing/FinalCTA';
import { Footer } from '@/components/marketing/landing/Footer';

export default function Home() {
  return (
    <main className="bg-[#FAFAF8] text-[#1A1A1A] min-h-screen">
      <Nav />
      <Hero />
      <SocialProof />
      <WhatItDoes />
      <HowItWorks />
      <MetricsStrip />
      <FinalCTA />
      <Footer />
    </main>
  );
}
