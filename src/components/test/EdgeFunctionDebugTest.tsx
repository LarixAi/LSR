import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const EdgeFunctionDebugTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEdgeFunction = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing edge function with minimal data...');
      
      const { data, error } = await supabase.functions.invoke('send-general-email', {
        body: {
          emailData: {
            to: 'test@example.com',
            subject: 'Debug Test',
            html: '<p>Test</p>'
          }
        }
      });

      console.log('Raw response:', { data, error });

      if (error) {
        setResult({
          success: false,
          message: `Edge function error: ${error.message}`,
          details: error,
          type: 'error'
        });
      } else {
        setResult({
          success: true,
          message: 'Edge function responded successfully!',
          details: data,
          type: 'success'
        });
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setResult({
        success: false,
        message: `Test error: ${error.message}`,
        details: error,
        type: 'exception'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🔍 Edge Function Debug Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
        <h3>🔧 Debugging Edge Function Error</h3>
        <p>
          The edge function is connecting (no CORS errors!) but returning a non-2xx status code. 
          This test will help us see the exact error message.
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
        <h3>🧪 Test Edge Function Response</h3>
        <p>This will show us the exact error from the edge function:</p>
        
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
          {isLoading ? 'Testing...' : 'Debug Edge Function'}
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
          
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Full Details</summary>
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
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '5px' }}>
        <h3>🔍 Common Issues & Solutions</h3>
        <ul>
          <li><strong>API Key Not Set:</strong> Run <code>supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_KEY</code></li>
          <li><strong>Invalid API Key:</strong> Make sure your Resend API key is valid and active</li>
          <li><strong>API Key Format:</strong> Should start with <code>re_</code></li>
          <li><strong>Resend Account:</strong> Ensure your Resend account is active and has credits</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '5px' }}>
        <h3>✅ Progress Made</h3>
        <ul>
          <li>✅ <strong>CORS Fixed:</strong> No more CORS header errors</li>
          <li>✅ <strong>Edge Function Connecting:</strong> Function is reachable</li>
          <li>✅ <strong>API Key Secret Set:</strong> Secret is configured</li>
          <li>⏳ <strong>Debugging Error:</strong> Working on the specific error</li>
        </ul>
      </div>
    </div>
  );
};

export default EdgeFunctionDebugTest;
