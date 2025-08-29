import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

export const useThemeColors = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    const savedHue = localStorage.getItem('themeHue');
    
    if (savedColor && savedHue) {
      applyColorTheme(savedHue, theme);
    }
  }, [theme]);

  const applyColorTheme = (hue: string, currentTheme: string) => {
    const root = document.documentElement;
    
    if (currentTheme === 'dark') {
      // Dark mode colors
      root.style.setProperty('--primary', `${hue} 72% 45%`);
      root.style.setProperty('--accent', `${hue} 60% 20%`);
      root.style.setProperty('--accent-foreground', `${hue} 60% 90%`);
      root.style.setProperty('--ring', `${hue} 72% 45%`);
      
      // Dark mode sidebar colors
      root.style.setProperty('--sidebar-background', `${hue} 35% 15%`);
      root.style.setProperty('--sidebar-foreground', `0 0% 98%`);
      root.style.setProperty('--sidebar-primary', `${hue} 72% 45%`);
      root.style.setProperty('--sidebar-primary-foreground', `0 0% 100%`);
      root.style.setProperty('--sidebar-accent', `${hue} 30% 20%`);
      root.style.setProperty('--sidebar-accent-foreground', `${hue} 15% 60%`);
      root.style.setProperty('--sidebar-border', `${hue} 25% 25%`);
      root.style.setProperty('--sidebar-ring', `${hue} 72% 45%`);
    } else {
      // Light mode colors
      root.style.setProperty('--primary', `${hue} 72% 40%`);
      root.style.setProperty('--accent', `${hue} 60% 95%`);
      root.style.setProperty('--accent-foreground', `${hue} 72% 35%`);
      root.style.setProperty('--ring', `${hue} 72% 40%`);
      
      // Light mode sidebar colors
      root.style.setProperty('--sidebar-background', `${hue} 40% 20%`);
      root.style.setProperty('--sidebar-foreground', `0 0% 100%`);
      root.style.setProperty('--sidebar-primary', `${hue} 72% 40%`);
      root.style.setProperty('--sidebar-primary-foreground', `0 0% 100%`);
      root.style.setProperty('--sidebar-accent', `${hue} 35% 25%`);
      root.style.setProperty('--sidebar-accent-foreground', `${hue} 20% 70%`);
      root.style.setProperty('--sidebar-border', `${hue} 30% 30%`);
      root.style.setProperty('--sidebar-ring', `${hue} 72% 40%`);
    }
  };

  return { applyColorTheme };
};
