import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TouchFriendlyCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  pressable?: boolean;
  variant?: 'default' | 'interactive' | 'elevated';
}

const TouchFriendlyCard: React.FC<TouchFriendlyCardProps> = ({
  title,
  description,
  children,
  onClick,
  className,
  pressable = true,
  variant = 'default'
}) => {
  const isMobile = useIsMobile();

  const baseStyles = cn(
    "transition-all duration-200",
    isMobile && [
      "min-h-[60px]", // Ensure minimum touch target size
      "active:scale-[0.98]", // Subtle press feedback
      "touch-manipulation",
    ],
    variant === 'interactive' && [
      "hover:shadow-md",
      "cursor-pointer",
      isMobile && "active:shadow-lg"
    ],
    variant === 'elevated' && [
      "shadow-sm hover:shadow-md",
      isMobile && "active:shadow-lg"
    ],
    className
  );

  const cardProps = {
    className: baseStyles,
    onClick: onClick,
    ...(onClick && {
      role: "button",
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    })
  };

  return (
    <Card {...cardProps}>
      {(title || description) && (
        <CardHeader className={cn(isMobile && "pb-3")}>
          {title && (
            <CardTitle className={cn(
              isMobile ? "text-lg" : "text-xl"
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              isMobile ? "text-sm" : "text-base"
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        isMobile && "p-4",
        (!title && !description) && isMobile && "p-4"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default TouchFriendlyCard;