import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EnhancedToastProps {
  title?: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  showCloseButton?: boolean;
  duration?: number;
}

export const EnhancedToast = ({
  title,
  description,
  variant = "info",
  action,
  onClose,
  showCloseButton = true
}: EnhancedToastProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const variants = {
    success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
  };

  const iconColors = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400", 
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400"
  };

  const Icon = icons[variant];

  return (
    <div className={cn(
      "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
      variants[variant]
    )}>
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[variant])} />
      
      <div className="flex-1 space-y-1">
        {title && (
          <div className="font-semibold text-sm leading-tight">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="mt-2 h-8 px-3 text-xs"
          >
            {action.label}
          </Button>
        )}
      </div>

      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  );
};

// Progress Toast for long-running operations
interface ProgressToastProps extends Omit<EnhancedToastProps, 'variant'> {
  progress: number; // 0-100
  status?: 'loading' | 'success' | 'error';
}

export const ProgressToast = ({
  title = "Processing...",
  description,
  progress,
  status = 'loading',
  onClose,
  showCloseButton = false
}: ProgressToastProps) => {
  const getVariant = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'info';
  };

  return (
    <div className="space-y-2">
      <EnhancedToast
        title={title}
        description={description}
        variant={getVariant()}
        onClose={onClose}
        showCloseButton={showCloseButton}
      />
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            status === 'success' ? 'bg-green-600' : 
            status === 'error' ? 'bg-red-600' : 'bg-blue-600'
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};