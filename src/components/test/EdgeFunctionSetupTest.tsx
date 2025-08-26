import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const EdgeFunctionSetupTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [emailAddress, setEmailAddress] = useState('test@example.com');

  const testEdgeFunction = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing edge function setup...');
      
      const { data, error } = await supabase.functions.invoke('send-general-email', {
        body: {
          emailData: {
            from: 'LSR Transport <noreply@lsr-transport.com>',
            to: [emailAddress],
            subject: 'Edge Function Setup Test',
            html: `
              <h1>Edge Function Test</h1>
              <p>This email was sent via the Supabase Edge Function!</p>
              <p>If you receive this, the setup is working correctly.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            `
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        setResult({
          success: false,
          message: `Edge function error: ${error.message}`,
          details: error
        });
      } else {
        console.log('Edge function response:', data);
        setResult({
          success: true,
          message: 'Edge function test successful!',
          details: data
        });
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setResult({
        success: false,
        message: `Test error: ${error.message}`,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🔧 Edge Function Setup Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '5px' }}>
        <h3>✅ Edge Function Deployed!</h3>
        <p>
          The <code>send-general-email</code> edge function has been successfully deployed to Supabase.
          This test will verify that the setup is working correctly.
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
        <h3>🧪 Test Edge Function Setup</h3>
        <p>This will test the edge function directly to verify the setup:</p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email Address to Send Test To:
          </label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="Enter email address"
          />
        </div>
        
        <button 
          onClick={testEdgeFunction}
          disabled={isLoading}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '5px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          {isLoading ? 'Testing Edge Function...' : 'Test Edge Function Setup'}
        </button>
      </div>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: result.success ? '#d4edda' : '#f8d7da', 
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`, 
          borderRadius: '5px' 
        }}>
          <h3>{result.success ? '✅ Success!' : '❌ Error'}</h3>
          <p style={{ fontWeight: 'bold' }}>{result.message}</p>
          
          {result.details && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Details</summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '3px', 
                overflow: 'auto',
                marginTop: '10px',
                fontSize: '12px'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
        <h3>🔧 Setup Checklist</h3>
        <ul>
          <li>✅ <strong>Edge Function Created:</strong> <code>send-general-email</code></li>
          <li>✅ <strong>CORS Headers Updated:</strong> Added user-agent and methods</li>
          <li>✅ <strong>Edge Function Deployed:</strong> Successfully deployed to Supabase</li>
          <li>⚠️ <strong>API Key Setup:</strong> Need to set <code>RESEND_API_KEY</code> secret</li>
          <li>⏳ <strong>Test Results:</strong> Run the test above to verify</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '5px' }}>
        <h3>📋 Next Steps</h3>
        <ol>
          <li><strong>Set API Key:</strong> Run <code>supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_KEY</code></li>
          <li><strong>Test Setup:</strong> Use the test button above</li>
          <li><strong>Verify Email:</strong> Check if test email is received</li>
          <li><strong>Test Full System:</strong> Go to <a href="/edge-function-email-test">Edge Function Email Test</a></li>
        </ol>
      </div>
    </div>
  );
};

export default EdgeFunctionSetupTest;
