import React, { useEffect, useState } from 'react';
import { useIsMobile, useOrientation } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableSwipeGestures?: boolean;
  showMobileHeader?: boolean;
  resizeToAvoidKeyboard?: boolean;
  scrollable?: boolean;
  padding?: 'small' | 'medium' | 'large';
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  enableSwipeGestures = true,
  showMobileHeader = true,
  resizeToAvoidKeyboard = true,
  scrollable = true,
  padding = 'medium'
}) => {
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState('100dvh');

  // Handle keyboard visibility and viewport changes
  useEffect(() => {
    const handleResize = () => {
      // Use visual viewport for accurate mobile height
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        if (resizeToAvoidKeyboard) {
          const keyboardHeight = window.innerHeight - window.visualViewport.height;
          setKeyboardHeight(Math.max(0, keyboardHeight));
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial call
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [resizeToAvoidKeyboard]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const paddingClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  const ContentWrapper = scrollable ? 'div' : 'div';
  const contentClassName = scrollable 
    ? 'flex-1 overflow-auto min-h-0' 
    : 'flex-1 min-h-0';

  return (
    <div 
      className={cn(
        "mobile-optimized-layout",
        "touch-manipulation",
        "overflow-x-hidden",
        "flex flex-col",
        "bg-background",
        orientation === 'landscape' && "landscape-mode",
        enableSwipeGestures && "swipe-enabled",
        className
      )}
      style={{
        // Dynamic viewport height handling
        minHeight: viewportHeight,
        height: viewportHeight,
        WebkitOverflowScrolling: 'touch',
        // Prevent zoom on double tap
        touchAction: enableSwipeGestures ? 'pan-x pan-y' : 'manipulation',
        // Handle keyboard
        paddingBottom: resizeToAvoidKeyboard ? keyboardHeight : 0
      }}
    >
      {/* Safe Area Top - Prevents UI from hiding under notches/status bars */}
      <div className="mobile-safe-area-top bg-background border-b border-border">
        <div className={cn("flex items-center justify-between", paddingClasses[padding])}>
          {showMobileHeader && (
            <div className="flex items-center space-x-3">
              {/* Mobile header content can be injected here */}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Area with Constraints */}
      <ContentWrapper className={contentClassName}>
        <div 
          className={cn(
            "mobile-content-wrapper",
            "w-full",
            "max-w-full",
            "mx-auto",
            paddingClasses[padding],
            scrollable && "pb-safe"
          )}
          style={{
            // Ensure content doesn't overflow
            minHeight: '0',
            // Add bottom padding for keyboard
            paddingBottom: resizeToAvoidKeyboard ? `${keyboardHeight + 16}px` : undefined
          }}
        >
          {/* Constraint-based layout wrapper */}
          <div className="w-full h-full flex flex-col">
            {children}
          </div>
        </div>
      </ContentWrapper>
      
      {/* Safe Area Bottom - Prevents UI from hiding under home indicators */}
      <div className="mobile-safe-area-bottom h-0 pb-safe" />
    </div>
  );
};

export default MobileOptimizedLayout;