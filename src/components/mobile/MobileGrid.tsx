import React from 'react';
import { useIsMobile, useViewport } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: 'sm' | 'md' | 'lg';
  adaptive?: boolean; // Automatically adjust columns based on content width
}

const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md',
  adaptive = false
}) => {
  const isMobile = useIsMobile();
  const { width } = useViewport();

  const getGridClasses = () => {
    if (adaptive) {
      // Auto-responsive grid that adapts to content
      return cn(
        "grid auto-fit-grid",
        gap === 'sm' && "gap-2",
        gap === 'md' && "gap-4",
        gap === 'lg' && "gap-6",
      );
    }

    return cn(
      "grid",
      // Mobile first approach
      `grid-cols-${mobileColumns}`,
      `md:grid-cols-${tabletColumns}`,
      `lg:grid-cols-${desktopColumns}`,
      gap === 'sm' && "gap-2 md:gap-3",
      gap === 'md' && "gap-3 md:gap-4 lg:gap-6",
      gap === 'lg' && "gap-4 md:gap-6 lg:gap-8",
    );
  };

  const gridStyle = adaptive ? {
    gridTemplateColumns: `repeat(auto-fit, minmax(${
      width < 768 ? '280px' : width < 1024 ? '320px' : '360px'
    }, 1fr))`
  } : undefined;

  return (
    <div 
      className={cn(getGridClasses(), className)}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

export default MobileGrid;