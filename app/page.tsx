import { Nav } from '@/components/marketing/landing/Nav';
import { Hero } from '@/components/marketing/landing/Hero';
import { WhatItDoes } from '@/components/marketing/landing/WhatItDoes';
import { HowItWorks } from '@/components/marketing/landing/HowItWorks';
import { MetricsStrip } from '@/components/marketing/landing/MetricsStrip';
import { Results } from '@/components/marketing/landing/Results';
import { SocialProof } from '@/components/marketing/landing/SocialProof';
import { FinalCTA } from '@/components/marketing/landing/FinalCTA';
import { Footer } from '@/components/marketing/landing/Footer';

export default function Home() {
  return (
    <main className="bg-[#0A0A0F] text-white min-h-screen">
      <Nav />
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <MetricsStrip />
      <Results />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </main>
  );
}
