import React, { useState } from 'react';

const BasicApiTest: React.FC = () => {
  const [showKey, setShowKey] = useState(false);
  
  // Get the API key from environment
  const apiKey = import.meta.env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  
  const isKeySet = apiKey && apiKey !== 're_your_api_key_here' && apiKey.length > 10;
  const isKeyValid = isKeySet && apiKey.startsWith('re_');

  const getKeyDisplay = () => {
    if (!apiKey) return 'No API key found';
    if (apiKey === 're_your_api_key_here') return 'API key not configured';
    if (showKey) return apiKey;
    return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  };

  const testEmail = async () => {
    if (!isKeyValid) {
      alert('Please configure a valid Resend API key first');
      return;
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      
      const result = await resend.emails.send({
        from: `LSR Transport <${apiKey ? 'test@example.com' : 'onboarding@resend.dev'}>`,
        to: ['test@example.com'],
        subject: 'Test Email from LSR Transport',
        html: '<h1>Test Email</h1><p>This is a test email to verify your API key is working.</p>',
      });

      alert(`Email sent successfully! Email ID: ${result.id}`);
    } catch (error: any) {
      alert(`Email Test Failed: ${error.message || "Failed to send test email"}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Basic API Key Test</h1>
      <p>Quick test of your Resend API key configuration</p>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>API Key Status</h3>
        <p>
          <strong>Status:</strong> 
          <span style={{ color: isKeyValid ? 'green' : 'red', marginLeft: '10px' }}>
            {isKeyValid ? '✅ Valid' : '❌ Invalid'}
          </span>
        </p>
        
        <p>
          <strong>API Key:</strong> 
          <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
            {getKeyDisplay()}
          </span>
          <button 
            onClick={() => setShowKey(!showKey)}
            style={{ marginLeft: '10px', padding: '2px 8px' }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </p>
        
        <p>
          <strong>Environment:</strong> {import.meta.env.MODE}
        </p>
        
        <p>
          <strong>Key Length:</strong> {apiKey ? apiKey.length : 0} characters
        </p>
      </div>

      {!isKeySet && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '5px' }}>
          <h4>❌ API Key Not Found</h4>
          <p>Please add your Resend API key to the <code>.env</code> file.</p>
          <p><strong>Format:</strong> <code>VITE_RESEND_API_KEY=re_your_actual_key_here</code></p>
        </div>
      )}

      {apiKey === 're_your_api_key_here' && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '5px' }}>
          <h4>❌ Placeholder Detected</h4>
          <p>You're using the placeholder API key. Please replace <code>re_your_api_key_here</code> with your actual Resend API key.</p>
        </div>
      )}

      {isKeySet && !isKeyValid && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '5px' }}>
          <h4>❌ Invalid API Key Format</h4>
          <p>Your API key should start with <code>re_</code>. Please check your Resend API key format.</p>
        </div>
      )}

      {isKeyValid && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '5px' }}>
          <h4>✅ API Key Valid!</h4>
          <p>Your Resend API key is properly configured. You can now test email functionality.</p>
          <button 
            onClick={testEmail}
            style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Test Email Sending
          </button>
        </div>
      )}

      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h4>Setup Instructions</h4>
        {isKeyValid ? (
          <p>✅ Your API key is ready! You can now test email functionality.</p>
        ) : (
          <div>
            <p>❌ API key needs to be configured</p>
            <ol>
              <li>Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">Resend Dashboard</a></li>
              <li>Add it to your <code>.env</code> file</li>
              <li>Restart your development server</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicApiTest;
