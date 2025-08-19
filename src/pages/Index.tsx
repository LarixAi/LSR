
import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import LandingNavigation from '@/components/landing/LandingNavigation';
import AnimatedHeroSection from '@/components/landing/AnimatedHeroSection';
import StatsSection from '@/components/landing/StatsSection';
import SolutionsSection from '@/components/landing/SolutionsSection';
import EnhancedFeaturesSection from '@/components/landing/EnhancedFeaturesSection';
import RolesSection from '@/components/landing/RolesSection';
import AdminUIPreviewSection from '@/components/landing/AdminUIPreviewSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ResourcesSection from '@/components/landing/ResourcesSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import AppDownloadSection from '@/components/landing/AppDownloadSection';
import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';
import CustomerPortalSection from '@/components/landing/CustomerPortalSection';

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Redirect authenticated users to appropriate dashboard based on role
  if (user) {
    // Note: We can't use profile here as it might not be loaded yet
    // This is a fallback redirect, the main Dashboard component will handle proper role-based routing
    return <Navigate to="/dashboard" replace />;
  }

  // Show mobile splash screen on mobile devices
  if (isMobile) {
    return <MobileSplashScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <LandingNavigation />
      <main>
        <AnimatedHeroSection />
        <CustomerPortalSection />
        <StatsSection />
        <SolutionsSection />
        <EnhancedFeaturesSection />
        <RolesSection />
        <AdminUIPreviewSection />
        <TestimonialsSection />
        <ResourcesSection />
        <PricingSection />
        <AboutSection />
        <AppDownloadSection />
        <ContactSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
