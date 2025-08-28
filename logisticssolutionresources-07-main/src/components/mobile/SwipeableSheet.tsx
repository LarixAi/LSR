import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { X } from "lucide-react";

interface SwipeableSheetProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const SwipeableSheet = ({
  children,
  trigger,
  title,
  description,
  side = 'bottom',
  size = 'md',
  showCloseButton = true,
  open,
  onOpenChange,
  className
}: SwipeableSheetProps) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: side === 'bottom' ? 'h-[40vh]' : side === 'top' ? 'h-[40vh]' : 'w-[300px]',
    md: side === 'bottom' ? 'h-[60vh]' : side === 'top' ? 'h-[60vh]' : 'w-[400px]',
    lg: side === 'bottom' ? 'h-[80vh]' : side === 'top' ? 'h-[80vh]' : 'w-[500px]',
    full: side === 'bottom' ? 'h-[95vh]' : side === 'top' ? 'h-[95vh]' : 'w-[90vw]'
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? side : 'right'}
        className={cn(
          "flex flex-col",
          isMobile && sizeClasses[size],
          side === 'bottom' && isMobile && "rounded-t-lg",
          side === 'top' && isMobile && "rounded-b-lg",
          className
        )}
      >
        {(title || showCloseButton) && (
          <SheetHeader className="relative">
            {side === 'bottom' && isMobile && (
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            )}
            
            {title && (
              <SheetTitle className={cn(
                showCloseButton && "pr-8"
              )}>
                {title}
              </SheetTitle>
            )}
            
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 p-0"
                onClick={() => onOpenChange?.(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </SheetHeader>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};