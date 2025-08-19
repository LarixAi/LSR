import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const AuthHeader = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Back to Homepage Button */}
      <Link 
        to="/" 
        className={`absolute ${isMobile ? 'top-8 left-4' : 'top-8 left-6'} z-20 flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200 group`}
      >
        <div className="p-2 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/60 transition-all duration-200 group-hover:scale-105">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:block font-medium text-sm">Back to Homepage</span>
      </Link>

      {/* Logo Section - Removed for cleaner design */}
    </>
  );
};

export default AuthHeader;