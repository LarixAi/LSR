
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
import Footer from '@/components/Footer';

import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';
import CustomerPortalSection from '@/components/landing/CustomerPortalSection';
import DriverAppSection from '@/components/landing/DriverAppSection';

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <LandingNavigation />
      <main className="relative z-10">
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
        <DriverAppSection />
        <ContactSection />
        <CTASection />
      </main>
      <LandingFooter />
      <Footer />
    </div>
  );
};

export default Index;
