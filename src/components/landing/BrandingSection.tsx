
import React from 'react';
import { Link } from 'react-router-dom';

interface BrandingSectionProps {
  isScrolled?: boolean;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({ isScrolled = false }) => {
  return (
    <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
      <img 
        src="/lovable-uploads/c7fc78b4-c136-43b3-b47e-00e97017921c.png" 
        alt="LSR Logistics Logo" 
        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
      />
      <div className="hidden sm:block">
        <span className={`text-xl sm:text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>LSR</span>
        <p className={`text-xs hidden md:block ${isScrolled ? 'text-gray-500' : 'text-gray-200'}`}>Logistics Solution Resources</p>
      </div>
    </Link>
  );
};

export default BrandingSection;
