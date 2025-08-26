import React, { useEffect, useState } from 'react';
import { useIsMobile, useOrientation } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveScaffoldProps {
  children: React.ReactNode;
  className?: string;
  resizeToAvoidKeyboard?: boolean;
  scrollable?: boolean;
  padding?: 'small' | 'medium' | 'large';
  showHeader?: boolean;
  headerContent?: React.ReactNode;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
}

const ResponsiveScaffold: React.FC<ResponsiveScaffoldProps> = ({
  children,
  className,
  resizeToAvoidKeyboard = true,
  scrollable = true,
  padding = 'medium',
  showHeader = false,
  headerContent,
  showFooter = false,
  footerContent
}) => {
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  const [constraints, setConstraints] = useState({ width: 0, height: 0 });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Handle viewport changes and constraints
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      const newWidth = window.innerWidth;
      
      // Detect keyboard visibility
      const isKeyboardVisible = newHeight < viewportHeight * 0.8;
      setKeyboardVisible(isKeyboardVisible);
      
      // Update constraints
      setConstraints({
        width: newWidth,
        height: newHeight
      });
      
      // Update viewport height for keyboard detection
      if (newHeight > viewportHeight) {
        setViewportHeight(newHeight);
      }
    };

    const handleOrientationChange = () => {
      // Reset viewport height on orientation change
      setViewportHeight(window.innerHeight);
      setTimeout(handleResize, 100); // Small delay to ensure proper measurement
    };

    // Set initial viewport height
    setViewportHeight(window.innerHeight);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [viewportHeight]);

  const paddingClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  // Responsive breakpoints (similar to Flutter's constraints)
  const isSmallPhone = constraints.width < 360 || constraints.height < 650;
  const isCompact = constraints.width < 400;
  const isLarge = constraints.width >= 768;

  const responsivePadding = isSmallPhone ? 'px-3' : 'px-4';
  const responsiveSpacing = isSmallPhone ? 'space-y-3' : 'space-y-4';

  if (!isMobile) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        {children}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "responsive-scaffold",
        "flex flex-col",
        "bg-background",
        "overflow-hidden",
        orientation === 'landscape' && "landscape-mode",
        keyboardVisible && "keyboard-visible",
        className
      )}
      style={{
        minHeight: '100vh',
        height: keyboardVisible ? 'auto' : '100vh',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
        // Ensure proper keyboard handling
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Safe Area Top */}
      <div className="safe-area-top bg-background border-b border-border flex-shrink-0">
        {showHeader && (
          <div className={cn("flex items-center justify-between", paddingClasses[padding])}>
            {headerContent}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {scrollable ? (
          <div 
            className={cn(
              "flex-1 overflow-auto",
              "scrollbar-hide"
            )}
            style={{
              // Ensure content is scrollable when keyboard is visible
              minHeight: keyboardVisible ? 'auto' : '0',
              maxHeight: keyboardVisible ? 'none' : '100%'
            }}
          >
            <div 
              className={cn(
                "w-full",
                "max-w-full",
                "mx-auto",
                responsivePadding,
                responsiveSpacing,
                "pb-safe"
              )}
              style={{
                // Add bottom padding when keyboard is visible
                paddingBottom: keyboardVisible ? '20px' : undefined
              }}
            >
              {/* Constraint-based content wrapper */}
              <div className="w-full min-h-full flex flex-col">
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={cn(
              "w-full flex-1",
              "max-w-full",
              "mx-auto",
              responsivePadding,
              responsiveSpacing
            )}
          >
            <div className="w-full h-full flex flex-col">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="safe-area-bottom bg-background border-t border-border flex-shrink-0">
          <div className={cn("flex items-center justify-between", paddingClasses[padding])}>
            {footerContent}
          </div>
        </div>
      )}

      {/* Safe Area Bottom */}
      <div className="safe-area-bottom h-0 pb-safe flex-shrink-0" />
    </div>
  );
};

export default ResponsiveScaffold;
