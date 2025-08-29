
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
    { name: 'Features', id: 'features' },
    { name: 'Platform', id: 'platform' },
    { name: 'Results', id: 'results' },
    { name: 'Customers', id: 'customers' },
    { name: 'Pricing', id: 'pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-primary grid place-items-center shadow-[0_0_0_3px_rgba(0,0,0,0.06)]">
            <span className="font-black text-primary-foreground">T</span>
          </div>
          <span className="font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">Transentrix</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="hover:text-muted-foreground transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/auth#demo" className="hidden sm:inline-flex">
            <Button variant="outline" className="rounded-xl">
              Book demo
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="rounded-xl shadow-lg shadow-primary/30">
              Get started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border py-4 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              {item.name}
            </button>
          ))}
          <div className="pt-4 px-3 flex flex-col gap-2">
            <Link to="/auth#demo" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl">
                Book demo
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full rounded-xl shadow-lg shadow-primary/30">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavigation;
