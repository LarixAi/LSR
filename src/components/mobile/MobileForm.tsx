import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
  scrollable?: boolean;
  padding?: 'small' | 'medium' | 'large';
}

const MobileForm: React.FC<MobileFormProps> = ({
  children,
  className,
  onSubmit,
  scrollable = true,
  padding = 'medium'
}) => {
  const isMobile = useIsMobile();

  const paddingClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  if (!isMobile) {
    return (
      <form onSubmit={handleSubmit} className={cn("w-full", className)}>
        {children}
      </form>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "mobile-form",
        "w-full",
        "flex flex-col",
        "min-h-0",
        className
      )}
    >
      <div className={cn(
        "w-full",
        "max-w-full",
        "mx-auto",
        paddingClasses[padding],
        "space-y-4"
      )}>
        {children}
      </div>
    </form>
  );
};

// Mobile-optimized form field component
interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  children,
  error,
  required = false,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized input component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  error,
  className,
  ...props
}) => {
  return (
    <input
      {...props}
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "mobile-input",
        "touch-manipulation",
        error && "border-destructive",
        className
      )}
      style={{
        // Prevent zoom on iOS
        fontSize: '16px',
        // Ensure proper touch target
        minHeight: '48px'
      }}
    />
  );
};

// Mobile-optimized textarea component
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  className?: string;
}

export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  error,
  className,
  ...props
}) => {
  return (
    <textarea
      {...props}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "mobile-textarea",
        "touch-manipulation",
        "resize-none",
        error && "border-destructive",
        className
      )}
      style={{
        // Prevent zoom on iOS
        fontSize: '16px',
        // Ensure proper touch target
        minHeight: '80px'
      }}
    />
  );
};

// Mobile-optimized button component
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizeClasses = {
    small: "h-10 px-3 text-sm",
    medium: "h-12 px-4 text-sm",
    large: "h-14 px-6 text-base"
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "mobile-button",
        "touch-manipulation",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={{
        // Ensure proper touch target
        minHeight: '48px',
        minWidth: '48px'
      }}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default MobileForm;
