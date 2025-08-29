import DOMPurify from 'dompurify';

export class InputValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
  private static readonly ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s-_]+$/;
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(\bUNION\b|\bJOIN\b)/i,
    /(--|\*\/|\/\*)/,
    /(\bOR\b|\bAND\b).*=.*\d+/i
  ];

  static validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    if (!this.EMAIL_REGEX.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
  }

  static validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }
    
    if (!this.PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid phone number format' };
    }
    
    return { valid: true };
  }

  static validateText(text: string, maxLength: number = 255): { valid: boolean; error?: string; sanitized?: string } {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text is required' };
    }
    
    if (text.length > maxLength) {
      return { valid: false, error: `Text must be less than ${maxLength} characters` };
    }
    
    // Check for SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return { valid: false, error: 'Invalid characters detected' };
      }
    }
    
    const sanitized = DOMPurify.sanitize(text);
    return { valid: true, sanitized };
  }

  static validateVehicleNumber(vehicleNumber: string): { valid: boolean; error?: string } {
    if (!vehicleNumber || typeof vehicleNumber !== 'string') {
      return { valid: false, error: 'Vehicle number is required' };
    }
    
    if (!this.ALPHANUMERIC_REGEX.test(vehicleNumber)) {
      return { valid: false, error: 'Vehicle number can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    
    if (vehicleNumber.length < 2 || vehicleNumber.length > 20) {
      return { valid: false, error: 'Vehicle number must be between 2 and 20 characters' };
    }
    
    return { valid: true };
  }

  static validateLicensePlate(licensePlate: string): { valid: boolean; error?: string } {
    if (!licensePlate || typeof licensePlate !== 'string') {
      return { valid: false, error: 'License plate is required' };
    }
    
    if (!this.ALPHANUMERIC_REGEX.test(licensePlate)) {
      return { valid: false, error: 'License plate can only contain letters, numbers, spaces, and hyphens' };
    }
    
    if (licensePlate.length < 5 || licensePlate.length > 15) {
      return { valid: false, error: 'License plate must be between 5 and 15 characters' };
    }
    
    return { valid: true };
  }

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    return { valid: true };
  }

  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = DOMPurify.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
