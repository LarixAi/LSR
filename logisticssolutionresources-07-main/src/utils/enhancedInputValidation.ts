
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove script tags and potentially dangerous content
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
  
  // Additional sanitization for SQL injection patterns
  return sanitized
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .trim();
};

// Comprehensive email validation
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 254 characters')
  .refine(
    (email) => {
      // Additional validation for common email issues
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      
      const [local, domain] = parts;
      
      // Local part validation
      if (local.length > 64) return false;
      if (local.startsWith('.') || local.endsWith('.')) return false;
      if (local.includes('..')) return false;
      
      // Domain validation
      if (domain.length > 253) return false;
      if (!domain.includes('.')) return false;
      if (domain.startsWith('.') || domain.endsWith('.')) return false;
      
      return true;
    },
    'Invalid email format'
  );

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
  .transform(sanitizeInput);

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .transform(sanitizeInput);

// Address validation
export const addressSchema = z
  .string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must be less than 200 characters')
  .transform(sanitizeInput);

// Enhanced signup schema
export const enhancedSignupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  first_name: nameSchema,
  last_name: nameSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Validate and sanitize form data
export const validateAndSanitizeFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
};

// XSS protection for text content
export const sanitizeForDisplay = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
};
