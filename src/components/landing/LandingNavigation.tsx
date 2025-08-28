
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandingSection from './BrandingSection';

const LandingNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`${isScrolled ? 'bg-white/95 shadow-lg border-b border-green-200' : 'bg-gradient-to-r from-green-600/20 to-green-500/10'} backdrop-blur-sm sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Left - Branding */}
          <div className="flex-shrink-0">
            <BrandingSection isScrolled={isScrolled} />
          </div>
          
          {/* Center - Navigation Items */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`${isScrolled ? 'text-gray-900 hover:text-green-700' : 'text-white hover:text-green-200'} transition-all duration-200 text-sm xl:text-base font-medium hover:scale-105 relative group`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isScrolled ? 'bg-green-600' : 'bg-white'} transition-all duration-300 group-hover:w-full`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Sign In Button */}
          <div className="flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            <Link to="/auth">
              <Button className={`${isScrolled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'} h-10 px-6 text-sm xl:h-11 xl:px-8 xl:text-base transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl font-semibold backdrop-blur-sm`}>
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`h-10 w-10 p-0 ${isScrolled ? 'bg-green-100 hover:bg-green-200 text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'} backdrop-blur-sm rounded-xl`}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-green-200 py-6 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-2xl animate-fade-in mb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-900 hover:text-green-700 transition-all duration-200 text-left py-3 text-base font-medium hover:bg-green-50 px-4 rounded-xl"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-green-200">
                                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base shadow-lg rounded-xl font-semibold">
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
