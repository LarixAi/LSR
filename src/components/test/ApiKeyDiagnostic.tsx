import React, { useState, useEffect } from 'react';

const ApiKeyDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {};

    // Check environment variables
    results.envCheck = {
      hasApiKey: !!import.meta.env.VITE_RESEND_API_KEY,
      apiKeyLength: import.meta.env.VITE_RESEND_API_KEY?.length || 0,
      apiKeyStartsWith: import.meta.env.VITE_RESEND_API_KEY?.startsWith('re_') || false,
      isPlaceholder: import.meta.env.VITE_RESEND_API_KEY === 're_your_api_key_here',
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not configured'
    };

    // Test API key directly
    if (results.envCheck.hasApiKey && !results.envCheck.isPlaceholder) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
        
        // Test with a simple API call
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['test@example.com'],
          subject: 'API Key Test',
          html: '<p>Test email</p>',
        });
        
        results.apiTest = {
          success: true,
          emailId: result.id,
          message: 'API key is valid and working'
        };
      } catch (error: any) {
        results.apiTest = {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
          details: error
        };
      }
    } else {
      results.apiTest = {
        success: false,
        error: 'API key not configured or is placeholder'
      };
    }

    // Check network connectivity with multiple tests
    results.networkTests = {};
    
    // Test 1: Basic connectivity to Resend
    try {
      const response1 = await fetch('https://api.resend.com/emails', {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      
      results.networkTests.basicConnectivity = {
        success: response1.ok,
        status: response1.status,
        statusText: response1.statusText,
        headers: Object.fromEntries(response1.headers.entries())
      };
    } catch (error: any) {
      results.networkTests.basicConnectivity = {
        success: false,
        error: error.message,
        type: error.name
      };
    }
    
    // Test 2: Test without API key (should give 401)
    try {
      const response2 = await fetch('https://api.resend.com/emails', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      results.networkTests.noAuthTest = {
        success: response2.ok,
        status: response2.status,
        statusText: response2.statusText
      };
    } catch (error: any) {
      results.networkTests.noAuthTest = {
        success: false,
        error: error.message,
        type: error.name
      };
    }
    
    // Test 3: Test with Resend SDK directly
    if (results.envCheck.hasApiKey && !results.envCheck.isPlaceholder) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
        
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['test@example.com'],
          subject: 'Network Test',
          html: '<p>Testing network connectivity</p>',
        });
        
        results.networkTests.sdkTest = {
          success: true,
          emailId: result.id,
          message: 'SDK test successful'
        };
      } catch (error: any) {
        results.networkTests.sdkTest = {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
          details: error
        };
      }
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🔍 Resend API Key Diagnostic Tool</h1>
      <p>This tool will help diagnose issues with your Resend API key configuration.</p>
      
      <button 
        onClick={runDiagnostics}
        disabled={isLoading}
        style={{ 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(diagnostics).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {/* Environment Check */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>🌍 Environment Variables</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
              {JSON.stringify(diagnostics.envCheck, null, 2)}
            </pre>
          </div>

          {/* API Test */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>🔑 API Key Test</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
              {JSON.stringify(diagnostics.apiTest, null, 2)}
            </pre>
          </div>

          {/* Network Tests */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>🌐 Network Connectivity Tests</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              <strong>Note:</strong> "Load failed" errors in Basic/No Auth tests are normal CORS restrictions. 
              The important test is the "SDK Direct Test" - if that passes, your email system is working!
            </p>
            <div style={{ marginBottom: '15px' }}>
              <h4>Basic Connectivity Test</h4>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
                {JSON.stringify(diagnostics.networkTests?.basicConnectivity, null, 2)}
              </pre>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <h4>No Auth Test (should fail)</h4>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
                {JSON.stringify(diagnostics.networkTests?.noAuthTest, null, 2)}
              </pre>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <h4>SDK Direct Test</h4>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
                {JSON.stringify(diagnostics.networkTests?.sdkTest, null, 2)}
              </pre>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '5px' }}>
            <h3>💡 Recommendations</h3>
            <ul>
              {!diagnostics.envCheck?.hasApiKey && (
                <li>❌ <strong>Missing API Key:</strong> Add VITE_RESEND_API_KEY to your .env file</li>
              )}
              {diagnostics.envCheck?.isPlaceholder && (
                <li>❌ <strong>Placeholder Detected:</strong> Replace 're_your_api_key_here' with your actual API key</li>
              )}
              {diagnostics.envCheck?.hasApiKey && !diagnostics.envCheck?.apiKeyStartsWith && (
                <li>❌ <strong>Invalid Format:</strong> API key should start with 're_'</li>
              )}
              {diagnostics.apiTest?.error?.includes('401') && (
                <li>❌ <strong>Authentication Failed:</strong> Your API key is invalid or expired. Get a new one from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">Resend Dashboard</a></li>
              )}
              {diagnostics.networkTests?.sdkTest?.error?.includes('401') && (
                <li>❌ <strong>API Key Invalid:</strong> Your API key is not working. Generate a new one from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">Resend Dashboard</a></li>
              )}
              {diagnostics.networkTests?.basicConnectivity?.error?.includes('Failed to fetch') && (
                <li>❌ <strong>Network Issue:</strong> Cannot reach Resend servers. Check your internet connection and firewall settings.</li>
              )}
              {diagnostics.networkTests?.sdkTest?.success && (
                <li>✅ <strong>Everything Working!</strong> Your API key is valid and the Resend SDK can send emails successfully. The "Load failed" errors are just CORS restrictions in the browser - your email system is working!</li>
              )}
              {diagnostics.apiTest?.success && !diagnostics.networkTests?.sdkTest?.success && (
                <li>⚠️ <strong>Partial Success:</strong> API key looks valid but SDK test is failing. Try refreshing the page.</li>
              )}
              {diagnostics.networkTests?.basicConnectivity?.error?.includes('Load failed') && diagnostics.networkTests?.sdkTest?.success && (
                <li>ℹ️ <strong>CORS Issue:</strong> Direct API calls are blocked by browser CORS, but the SDK works fine. This is normal and expected.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyDiagnostic;
