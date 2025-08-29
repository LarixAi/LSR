import React from 'react';

interface CSPMetaProps {
  nonce?: string;
}

const CSPMeta: React.FC<CSPMetaProps> = ({ nonce }) => {
  // Note: frame-src and frame-ancestors removed for Lovable iframe compatibility
  // These should be re-enabled in production deployments
  const cspPolicy = [
    "default-src 'self'",
    `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://api.pwnedpasswords.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.pwnedpasswords.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  React.useEffect(() => {
    // Set CSP via meta tag if not already set by server
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = cspPolicy;
      document.head.appendChild(meta);

      return () => {
        if (document.head.contains(meta)) {
          document.head.removeChild(meta);
        }
      };
    }
  }, [cspPolicy]);

  return null;
};

export default CSPMeta;