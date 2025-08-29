import React from 'react';
import { useIsMobile, useOrientation } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableSwipeGestures?: boolean;
  showMobileHeader?: boolean;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  enableSwipeGestures = true,
  showMobileHeader = true
}) => {
  const isMobile = useIsMobile();
  const orientation = useOrientation();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={cn(
        "mobile-optimized-layout",
        "touch-manipulation",
        "overflow-x-hidden",
        "min-h-screen",
        "flex flex-col",
        orientation === 'landscape' && "landscape-mode",
        enableSwipeGestures && "swipe-enabled",
        className
      )}
      style={{
        // Ensure proper mobile viewport
        minHeight: '100dvh', // Use dynamic viewport height
        maxHeight: '100dvh',
        WebkitOverflowScrolling: 'touch',
        // Prevent zoom on double tap
        touchAction: enableSwipeGestures ? 'pan-x pan-y' : 'manipulation'
      }}
    >
      {showMobileHeader && (
        <div className="mobile-safe-area-top bg-background border-b">
          <div className="px-4 py-2">
            {/* Mobile-specific header content can go here */}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <div className="mobile-content-wrapper p-3 pb-safe">
          {children}
        </div>
      </div>
      
      {/* Safe area padding for bottom */}
      <div className="mobile-safe-area-bottom h-0 pb-safe" />
    </div>
  );
};

export default MobileOptimizedLayout;