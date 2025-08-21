import React from 'react';

const MobileTest: React.FC = () => {
  console.log('MobileTest component rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          LSR Mobile Test
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Basic mobile test - no external dependencies
        </p>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#333', fontSize: '14px' }}>
            App is running successfully!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileTest;
