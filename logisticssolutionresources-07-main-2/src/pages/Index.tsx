
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import LandingNavigation from '@/components/landing/LandingNavigation';
import TransportHeroSection from '@/components/landing/TransportHeroSection';
import ValueStatsSection from '@/components/landing/ValueStatsSection';
import ResultsSection from '@/components/landing/ResultsSection';
import TransportServicesSection from '@/components/landing/TransportServicesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTABottom from '@/components/landing/CTABottom';
import NewFooter from '@/components/landing/NewFooter';
import FloatingElements from '@/components/landing/FloatingElements';

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show mobile splash screen on mobile devices
  if (isMobile) {
    return <MobileSplashScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      <main>
        <TransportHeroSection />
        <ValueStatsSection />
        <ResultsSection />
        <TransportServicesSection id="features" />
        <TestimonialsSection id="customers" />
        <PricingSection />
        <CTABottom />
      </main>
      <NewFooter />
      <FloatingElements />
    </div>
  );
};

export default Index;
