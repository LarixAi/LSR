/**
 * Enhanced Content Security Policy for secure iframe communication
 */

// CSP configuration to handle development environment safely
const isDevelopment = import.meta.env.DEV;

export const generateSecureCSP = () => {
  const baseCSP = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://dznbihypzmvcmradijqn.supabase.co"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:"
    ],
    'connect-src': [
      "'self'",
      "https://dznbihypzmvcmradijqn.supabase.co",
      "https://*.supabase.co",
      "wss://dznbihypzmvcmradijqn.supabase.co",
      "wss://*.supabase.co"
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };

  // In development, allow additional sources for HMR and debugging
  if (isDevelopment) {
    baseCSP['connect-src'].push(
      "ws://localhost:*",
      "http://localhost:*",
      "https://lovable.dev"
    );
    baseCSP['frame-src'] = ["'self'", "https://lovable.dev"];
  }

  // Convert to CSP string
  return Object.entries(baseCSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Apply CSP header
export const applyCSP = () => {
  if (typeof document === 'undefined') return;
  
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) {
    existingMeta.remove();
  }

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateSecureCSP();
  document.head.appendChild(meta);
};

// Enhanced security headers with development considerations
export const ENHANCED_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': isDevelopment ? 'SAMEORIGIN' : 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};