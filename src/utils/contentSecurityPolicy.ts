
// Content Security Policy configuration
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for some React features
    "https://maps.googleapis.com",
    "https://dznbihypzmvcmradijqn.supabase.co"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "blob:"
  ],
  'connect-src': [
    "'self'",
    "https://dznbihypzmvcmradijqn.supabase.co",
    "https://*.supabase.co",
    "https://maps.googleapis.com",
    "wss://dznbihypzmvcmradijqn.supabase.co",
    "wss://*.supabase.co"
  ],
  'frame-src': [
    "'self'",
    "https://maps.google.com"
  ],
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'"
};

// Generate CSP header value
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      const sourceList = Array.isArray(sources) ? sources.join(' ') : sources;
      return `${directive} ${sourceList}`;
    })
    .join('; ');
};

// Apply CSP meta tag (for client-side enforcement)
export const applyCSP = () => {
  if (typeof document === 'undefined') return;

  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) return; // Already applied

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPHeader();
  document.head.appendChild(meta);
};

// Security headers for enhanced protection
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)'
};
