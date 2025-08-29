
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Zod validation schemas for common input types
export const emailSchema = z.string().email('Invalid email format');
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

// User creation validation schema
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: phoneSchema.optional(),
  role: z.enum(['driver', 'mechanic', 'admin', 'parent', 'council', 'compliance_officer']),
  organizationId: uuidSchema.optional(),
  // Driver-specific fields
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  hireDate: z.string().optional(),
  cdlNumber: z.string().max(50).optional(),
  medicalCardExpiry: z.string().optional(),
});

// Password reset validation schema
export const resetPasswordSchema = z.object({
  targetUserId: uuidSchema.optional(),
  targetEmail: emailSchema.optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  forceMustChange: z.boolean().default(true),
  adminSecret: z.string().optional(),
}).refine((data) => data.targetUserId || data.targetEmail, {
  message: "Either targetUserId or targetEmail must be provided",
});

// Generic validation helper
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.issues.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

// Enhanced input validation with security focus
export class SecureInputValidator {
  
  // Sanitize HTML to prevent XSS
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize general text input
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:/gi, '') // Remove data: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: URLs
      .trim();
  }

  // Validate email with security checks
  static validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!email || email.length === 0) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.includes('--')) {
      errors.push('Email contains suspicious patterns');
    }

    // Length check
    if (email.length > 254) {
      errors.push('Email is too long');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate phone number
  static validatePhone(phone: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!phone || phone.length === 0) {
      return { isValid: true, errors }; // Phone is optional
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.push('Phone number must be between 10-15 digits');
    }

    // Check for suspicious patterns
    if (/(.)\1{9,}/.test(digitsOnly)) {
      errors.push('Phone number contains suspicious patterns');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate vehicle number with security checks
  static validateVehicleNumber(vehicleNumber: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!vehicleNumber || vehicleNumber.length === 0) {
      errors.push('Vehicle number is required');
      return { isValid: false, errors };
    }

    // Length check
    if (vehicleNumber.length < 2 || vehicleNumber.length > 20) {
      errors.push('Vehicle number must be between 2-20 characters');
    }

    // Alphanumeric check
    if (!/^[a-zA-Z0-9\-_\s]+$/.test(vehicleNumber)) {
      errors.push('Vehicle number can only contain letters, numbers, hyphens, underscores, and spaces');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate license plate
  static validateLicensePlate(licensePlate: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!licensePlate || licensePlate.length === 0) {
      errors.push('License plate is required');
      return { isValid: false, errors };
    }

    // Length check
    if (licensePlate.length < 5 || licensePlate.length > 15) {
      errors.push('License plate must be between 5-15 characters');
    }

    // Alphanumeric check
    if (!/^[a-zA-Z0-9\s]+$/.test(licensePlate)) {
      errors.push('License plate can only contain letters, numbers, and spaces');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate text fields with length limits
  static validateText(
    text: string, 
    fieldName: string, 
    minLength: number = 0, 
    maxLength: number = 1000,
    required: boolean = false
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (required && (!text || text.trim().length === 0)) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    if (text && text.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters`);
    }

    if (text && text.length > maxLength) {
      errors.push(`${fieldName} must not exceed ${maxLength} characters`);
    }

    // Check for potential script injection
    if (text && (text.includes('<script') || text.includes('javascript:'))) {
      errors.push(`${fieldName} contains invalid content`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validate numeric inputs
  static validateNumber(
    value: any, 
    fieldName: string, 
    min?: number, 
    max?: number,
    required: boolean = false
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    if (value !== null && value !== undefined && value !== '') {
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        errors.push(`${fieldName} must be a valid number`);
        return { isValid: false, errors };
      }

      if (min !== undefined && numValue < min) {
        errors.push(`${fieldName} must be at least ${min}`);
      }

      if (max !== undefined && numValue > max) {
        errors.push(`${fieldName} must not exceed ${max}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Rate limiting check for form submissions
  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Filter out old attempts
    const validAttempts = attempts.filter((time: number) => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));
    
    return true;
  }

  // Organization context validation
  static validateOrganizationContext(userOrgId: string | null, targetOrgId: string): boolean {
    if (!userOrgId || !targetOrgId) {
      return false;
    }
    return userOrgId === targetOrgId;
  }

  // Sanitize email helper
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
