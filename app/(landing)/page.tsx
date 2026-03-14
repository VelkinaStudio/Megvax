'use client';

import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  HeroSection,
  FeaturesSection,
  SocialProofSection,
  HowItWorksSection,
  CTASection,
  SmoothScroll,
} from '@/components/marketing/landing';

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-white overflow-x-hidden">
        <MarketingNav variant="dark" />
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <HowItWorksSection />
        <CTASection />
        <MarketingFooter />
      </main>
    </SmoothScroll>
  );
}
