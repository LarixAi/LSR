import { useEffect, useState } from 'react';

type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<BreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = (breakpoint: BreakpointKey) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [breakpoint]);

  return matches;
};

export const useIsMobile = () => {
  return !useBreakpoint('md');
};

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  }>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return screenSize;
};