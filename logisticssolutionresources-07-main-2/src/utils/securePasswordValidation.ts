
import { z } from 'zod';

// Enhanced password validation schema
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .refine((password) => !/(.)\1{2,}/.test(password), 'Password cannot contain more than 2 consecutive identical characters')
  .refine((password) => !/^(password|123456|qwerty|abc123|admin)/i.test(password), 'Password cannot be a common password');

export const validatePassword = (password: string) => {
  try {
    passwordSchema.parse(password);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.issues.map(err => err.message) 
      };
    }
    return { valid: false, errors: ['Password validation failed'] };
  }
};

export const checkPasswordBreaches = async (password: string): Promise<boolean> => {
  try {
    // Check against common breached passwords using HaveIBeenPwned API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return false; // If API fails, don't block the user
    
    const text = await response.text();
    return text.includes(suffix);
  } catch (error) {
    console.error('Password breach check failed:', error);
    return false; // Don't block user if check fails
  }
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
  maxScore: number;
} => {
  let score = 0;
  const maxScore = 10;
  
  // Length scoring (more points for longer passwords)
  if (password.length >= 8) score++;
  if (password.length >= 12) score += 2;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  
  // Character variety
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  // Advanced checks
  if (!/(.)\1{2,}/.test(password)) score++; // No repeated characters
  if (!/^(password|123456|qwerty|abc123|admin)/i.test(password)) score++; // Not common password

  // Calculate percentage
  const percentage = (score / maxScore) * 100;
  
  if (percentage <= 30) return { score, label: 'Very Weak', color: 'red', maxScore };
  if (percentage <= 50) return { score, label: 'Weak', color: 'orange', maxScore };
  if (percentage <= 70) return { score, label: 'Fair', color: 'yellow', maxScore };
  if (percentage <= 85) return { score, label: 'Good', color: 'blue', maxScore };
  return { score, label: 'Very Strong', color: 'green', maxScore };
};
