import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
}

export const FloatingActionButton = ({
  onClick,
  icon: Icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  className
}: FloatingActionButtonProps) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size="icon"
      className={cn(
        "fixed z-50 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      aria-label={label}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
};

export const ScrollToTopButton = ({ 
  threshold = 300,
  className 
}: { 
  threshold?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <FloatingActionButton
      onClick={scrollToTop}
      icon={ArrowUp}
      label="Scroll to top"
      className={className}
    />
  );
};