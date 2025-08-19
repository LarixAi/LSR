import React, { useState, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  refreshThreshold?: number;
  className?: string;
}

const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  children,
  refreshThreshold = 80,
  className
}) => {
  const isMobile = useIsMobile();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !scrollRef.current) return;
    
    // Only allow pull to refresh when at the top of the scroll
    if (scrollRef.current.scrollTop > 0) return;
    
    touchStartY.current = e.touches[0].clientY;
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !scrollRef.current || touchStartY.current === 0) return;
    
    // Only allow pull to refresh when at the top of the scroll
    if (scrollRef.current.scrollTop > 0) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    
    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance * 0.5, refreshThreshold * 1.5));
      
      // Prevent default scrolling when pulling down
      e.preventDefault();
    }
  }, [isMobile, refreshThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile) return;
    
    setIsPulling(false);
    touchStartY.current = 0;
    
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isMobile, pullDistance, refreshThreshold, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const shouldShowRefreshIndicator = isPulling || isRefreshing;
  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const willRefresh = refreshProgress >= 1;

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-200",
          "bg-background/90 backdrop-blur-sm border-b",
          shouldShowRefreshIndicator ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`
        }}
      >
        <div className="flex flex-col items-center space-y-1">
          <RefreshCw 
            className={cn(
              "w-5 h-5 transition-all duration-200",
              willRefresh || isRefreshing ? "text-primary" : "text-muted-foreground",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${refreshProgress * 180}deg)`
            }}
          />
          <span className="text-xs text-muted-foreground">
            {isRefreshing 
              ? "Refreshing..." 
              : willRefresh 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div 
        ref={scrollRef}
        className="overflow-auto h-full"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? Math.max(pullDistance, isRefreshing ? 60 : 0) : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobilePullToRefresh;