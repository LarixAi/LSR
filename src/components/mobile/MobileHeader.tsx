import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  className?: string;
}

export const MobileHeader = ({
  title,
  showBackButton = false,
  showMenuButton = false,
  actions,
  onMenuClick,
  className
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
          
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {actions && actions}
        </div>
      </div>
    </header>
  );
};

interface MobileTabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}: MobileTabsProps) => {
  return (
    <div className={cn(
      "sticky top-14 z-40 w-full border-b bg-background",
      className
    )}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                "min-w-0 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 min-w-[1.25rem] h-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};