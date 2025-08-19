
import { z } from 'zod';

// Enhanced password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const validatePassword = (password: string) => {
  try {
    passwordSchema.parse(password);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.errors.map(err => err.message) 
      };
    }
    return { valid: false, errors: ['Password validation failed'] };
  }
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'red' };
  if (score <= 4) return { score, label: 'Fair', color: 'orange' };
  if (score <= 5) return { score, label: 'Good', color: 'yellow' };
  return { score, label: 'Strong', color: 'green' };
};
