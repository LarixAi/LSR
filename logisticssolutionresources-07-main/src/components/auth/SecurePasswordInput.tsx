import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validatePassword, checkPasswordBreaches } from '@/utils/securePasswordValidation';
import { useDebouncedCallback } from 'use-debounce';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
  checkBreaches?: boolean;
  className?: string;
}

const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = false,
  showStrengthIndicator = true,
  checkBreaches = true,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isBreached, setIsBreached] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);

  const validateAndCheck = useCallback(async (password: string) => {
    // Validate password strength
    const validation = validatePassword(password);
    setValidationErrors(validation.errors);

    // Check for breaches if enabled and password is valid
    let breached = false;
    if (checkBreaches && password.length >= 8) {
      setIsCheckingBreach(true);
      try {
        breached = await checkPasswordBreaches(password);
        setIsBreached(breached);
      } catch (error) {
        console.error('Breach check failed:', error);
      } finally {
        setIsCheckingBreach(false);
      }
    }

    const isValid = validation.valid && !breached;
    const allErrors = [...validation.errors];
    if (breached) {
      allErrors.push('This password has been found in data breaches. Please choose a different password.');
    }

    onValidationChange?.(isValid, allErrors);
  }, [checkBreaches, onValidationChange]);

  const debouncedValidateAndCheck = useDebouncedCallback(validateAndCheck, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue) {
      debouncedValidateAndCheck(newValue);
    } else {
      setValidationErrors([]);
      setIsBreached(false);
      onValidationChange?.(false, []);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasErrors = validationErrors.length > 0 || isBreached;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`pr-12 ${hasErrors ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showStrengthIndicator && value && (
        <PasswordStrengthIndicator password={value} />
      )}

      {isCheckingBreach && (
        <div className="text-sm text-muted-foreground">
          Checking password security...
        </div>
      )}

      {isBreached && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This password has been found in data breaches. Please choose a different password for your security.
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <div className="space-y-1">
          {validationErrors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { SecurePasswordInput };