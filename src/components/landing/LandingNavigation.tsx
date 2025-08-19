
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandingSection from './BrandingSection';

const LandingNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Solutions', id: 'solutions' },
    { name: 'Features', id: 'features' },
    { name: 'Admin Preview', id: 'admin-preview' },
    { name: 'Resources', id: 'resources' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <BrandingSection />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-700 hover:text-primary transition-colors text-sm xl:text-base font-medium hover:scale-105 transition-transform duration-200"
              >
                {item.name}
              </button>
            ))}
            <div className="flex items-center space-x-2 xl:space-x-3">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white h-9 px-3 text-sm xl:h-10 xl:px-4 xl:text-base transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-8 w-8 p-0"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white/95 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 hover:text-primary transition-colors text-left py-2 text-base font-medium hover:bg-gray-50 px-2 rounded-lg"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white h-11 text-base shadow-lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavigation;
