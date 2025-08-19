import { RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "dots";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState = ({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "min-h-screen",
    className
  );

  const renderSpinner = () => (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && (
          <p className={cn("text-muted-foreground", textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  const renderPulse = () => (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <div className={cn(
          "rounded-full bg-primary animate-pulse",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn("text-muted-foreground", textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  const renderDots = () => (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                "rounded-full bg-primary animate-pulse",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn("text-muted-foreground", textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case "pulse":
      return renderPulse();
    case "dots":
      return renderDots();
    default:
      return renderSpinner();
  }
};

export const InlineLoader = ({ 
  className, 
  size = "sm" 
}: { 
  className?: string; 
  size?: "sm" | "md" | "lg" 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  return (
    <RefreshCw className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />
  );
};