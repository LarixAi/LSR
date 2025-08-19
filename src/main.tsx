
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundaryDev from '@/components/ErrorBoundaryDev';

import './index.css';

// Console optimizations disabled to fix import errors
// These were causing runtime module loading issues

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <ErrorBoundaryDev>
      <App />
    </ErrorBoundaryDev>
  </StrictMode>
);
