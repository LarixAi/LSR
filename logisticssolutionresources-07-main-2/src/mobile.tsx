import React from 'react';
import ReactDOM from 'react-dom/client';
import MobileApp from './MobileApp';
import './index.css';
import './styles/mobile.css';

// Mobile-specific entry point
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileApp />
  </React.StrictMode>,
);