import React from 'react';

const SecurityHeaders: React.FC = () => {
  React.useEffect(() => {
    // Add security headers via meta tags where possible
    // Note: X-Frame-Options removed for Lovable iframe compatibility
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    const addedMetas: HTMLMetaElement[] = [];

    headers.forEach(({ name, content }) => {
      const existing = document.querySelector(`meta[http-equiv="${name}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.httpEquiv = name;
        meta.content = content;
        document.head.appendChild(meta);
        addedMetas.push(meta);
      }
    });

    // Cleanup function
    return () => {
      addedMetas.forEach(meta => {
        if (document.head.contains(meta)) {
          document.head.removeChild(meta);
        }
      });
    };
  }, []);

  return null;
};

export default SecurityHeaders;