import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Zap, Sparkles } from 'lucide-react';

const MobileSplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    // Animation sequence - slowed down for better visibility
    const timer1 = setTimeout(() => setShowLogo(true), 500);
    const timer2 = setTimeout(() => setShowText(true), 1500);
    const timer3 = setTimeout(() => setShowSubtext(true), 2500);
    
    // Redirect to login after splash animation - increased time
    const redirectTimer = setTimeout(() => {
      navigate('/auth');
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden safe-area-inset">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo Animation */}
        <div className={`transition-all duration-1500 ease-out ${showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'}`}>
          <div className="relative mb-12">
            <div className="w-32 h-32 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-200 dark:border-slate-700 transition-transform duration-700 ease-out">
              <img 
                src="/lovable-uploads/c7fc78b4-c136-43b3-b47e-00e97017921c.png" 
                alt="LSR Logo" 
                className="w-20 h-20 object-contain transition-opacity duration-700 ease-out"
              />
            </div>
          </div>
        </div>

        {/* Main Title Animation */}
        <div className={`transition-all duration-1200 ease-out ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
            LSR Logistics
          </h1>
        </div>

        {/* Subtext Animation */}
        <div className={`transition-all duration-1200 ease-out delay-300 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium mb-3">
            Transport Management System
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Professional logistics solutions for modern transportation needs
          </p>
        </div>

        {/* Loading Animation */}
        <div className={`mt-16 transition-all duration-1000 ease-out delay-700 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
          Powered by Logistics Solution Resources
        </p>
      </div>
    </div>
  );
};

export default MobileSplashScreen;