import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { HeroSection } from './components/HeroSection';
import { InsightsSection } from './components/InsightsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { AboutSection } from './components/AboutSection';
import { CtaBandSection } from './components/CtaBandSection';
import { LandingFooter } from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-app text-body selection:bg-brand-500/20 selection:text-ink">
      {/* Fixed Frosted Glass Navigation Bar */}
      <PublicNavbar />

      <main>
        {/* Hero Section matching the user's reference image */}
        <HeroSection />

        {/* Live Platform Preview with Illustrative Data & Recharts */}
        <InsightsSection />

        {/* 3-Step Guided Onboarding & Security */}
        <HowItWorksSection />

        {/* Feature Matrix with Availability Badges */}
        <FeaturesSection />

        {/* About, Mission & Tech Stack Architecture */}
        <AboutSection />

        {/* High-Impact CTA Band */}
        <CtaBandSection />
      </main>

      {/* Brand & Security Footer */}
      <LandingFooter />
    </div>
  );
}
