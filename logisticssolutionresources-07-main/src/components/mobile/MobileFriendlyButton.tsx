import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MobileFriendlyButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  touchFeedback?: boolean;
}

const MobileFriendlyButton: React.FC<MobileFriendlyButtonProps> = ({
  children,
  className,
  loading = false,
  loadingText,
  touchFeedback = true,
  disabled,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <Button
      className={cn(
        isMobile && [
          "min-h-[48px]", // Minimum touch target size
          "min-w-[48px]",
          "text-base", // Larger text for mobile
          "px-6 py-3", // More padding for easier touch
          touchFeedback && [
            "active:scale-[0.98]", // Subtle press feedback
            "transition-transform duration-150"
          ]
        ],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading ? (loadingText || children) : children}
    </Button>
  );
};

export default MobileFriendlyButton;